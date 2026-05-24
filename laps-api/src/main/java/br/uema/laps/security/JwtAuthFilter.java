package br.uema.laps.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final LapsJwtService jwtService;

    public JwtAuthFilter(LapsJwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain
    ) throws ServletException, IOException {

        // Never touch CORS preflight requests — they must reach Spring's CorsFilter
        // unmolested or the browser will see "missing Access-Control-Allow-Origin".
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        String token = extractToken(request);

        if (token != null) {
            try {
                Claims claims = jwtService.parseClaims(token);
                String memberId = claims.getSubject();
                String role = claims.get("role", String.class);

                var auth = new UsernamePasswordAuthenticationToken(
                        memberId, null,
                        List.of(new SimpleGrantedAuthority(role))
                );
                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (Exception ex) {
                // Token present but invalid/expired. Clear the bad cookie and respond
                // 401 so the SPA can re-authenticate cleanly instead of seeing 403s
                // on admin PUT requests (the previous silent-swallow behavior left
                // SecurityContext empty and the authorization layer returned 403,
                // which looked like a permission issue rather than session expiry).
                Cookie cleared = new Cookie("laps_jwt", "");
                cleared.setPath("/");
                cleared.setMaxAge(0);
                cleared.setHttpOnly(true);
                response.addCookie(cleared);
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write(
                        "{\"code\":\"token_invalid\",\"message\":\"Session expired — please log in again\"}"
                );
                return;
            }
        }

        chain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie c : request.getCookies()) {
                if ("laps_jwt".equals(c.getName())) return c.getValue();
            }
        }
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) return header.substring(7);
        return null;
    }
}
