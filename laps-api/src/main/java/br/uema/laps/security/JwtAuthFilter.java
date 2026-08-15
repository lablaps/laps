package br.uema.laps.security;

import br.uema.laps.member.Member;
import br.uema.laps.member.MemberRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final LapsJwtService jwtService;
    private final MemberRepository memberRepository;
    private final MemberAccessPolicy accessPolicy;
    private final ManagerAllowlist managerAllowlist;
    private final AuthCookies authCookies;

    public JwtAuthFilter(
            LapsJwtService jwtService,
            MemberRepository memberRepository,
            MemberAccessPolicy accessPolicy,
            ManagerAllowlist managerAllowlist,
            AuthCookies authCookies) {
        this.jwtService = jwtService;
        this.memberRepository = memberRepository;
        this.accessPolicy = accessPolicy;
        this.managerAllowlist = managerAllowlist;
        this.authCookies = authCookies;
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
            Member member;
            try {
                Claims claims = jwtService.parseClaims(token);
                member = loadSubject(claims).orElse(null);
            } catch (Exception ex) {
                // Token present but invalid/expired. Clear the bad cookie and respond
                // 401 so the SPA can re-authenticate cleanly instead of seeing 403s
                // on admin PUT requests (the previous silent-swallow behavior left
                // SecurityContext empty and the authorization layer returned 403,
                // which looked like a permission issue rather than session expiry).
                reject(request, response, "token_invalid", "Session expired — please log in again");
                return;
            }

            // A correctly-signed token is not on its own proof of a live account.
            // Membership is re-checked here on every request so that removing a
            // member takes effect immediately rather than whenever their token
            // happens to expire — up to LAPS_JWT_TTL (8h in production) later.
            if (!accessPolicy.mayAuthenticate(member)) {
                reject(request, response, "account_inactive", "This account is no longer active");
                return;
            }

            // Authority is recomputed from the current allowlist rather than read
            // from the token's `role` claim. The claim records what was true when
            // the token was minted; removing someone from LAPS_MANAGER_EMAILS has
            // to revoke their admin access now, not at expiry.
            String role = managerAllowlist.roleFor(member);

            var auth = new UsernamePasswordAuthenticationToken(
                    member.getId().toString(), null,
                    List.of(new SimpleGrantedAuthority(role))
            );
            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        chain.doFilter(request, response);
    }

    private Optional<Member> loadSubject(Claims claims) {
        return memberRepository.findById(UUID.fromString(claims.getSubject()));
    }

    private void reject(HttpServletRequest request, HttpServletResponse response, String code, String message)
            throws IOException {
        SecurityContextHolder.clearContext();
        response.addHeader(HttpHeaders.SET_COOKIE, authCookies.clear(request).toString());
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"code\":\"" + code + "\",\"message\":\"" + message + "\"}");
    }

    private String extractToken(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie c : request.getCookies()) {
                if (AuthCookies.COOKIE_NAME.equals(c.getName())) return c.getValue();
            }
        }
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) return header.substring(7);
        return null;
    }
}
