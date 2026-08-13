package br.uema.laps.config;

import br.uema.laps.security.JwtAuthFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

import static org.springframework.security.web.util.matcher.AntPathRequestMatcher.antMatcher;

@Configuration
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Value("${laps.cors.allowed-origins}")
    private String allowedOriginsRaw;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    /**
     * Public chain — scoped only to the truly public API surface: /api/v1/auth/** (login,
     * logout, set-password) and /api/v1/invites/** (validate invite, register from invite).
     *
     * This chain runs ahead of {@link #mainFilterChain} and is *completely independent* of it.
     * Anything matched here never reaches the main chain's matcher logic, so Spring Security's
     * MvcRequestMatcher / PathPatternRequestMatcher choice can't accidentally "consume" these
     * paths into the authenticated bucket. No JwtAuthFilter either — these endpoints don't
     * need a SecurityContext and one of them (login) is responsible for *issuing* the JWT.
     */
    @Bean
    @Order(1)
    public SecurityFilterChain publicFilterChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher(new OrRequestMatcher(
                antMatcher("/api/v1/auth/**"),
                antMatcher("/api/v1/invites/**")
            ))
            .cors(c -> c.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }

    @Bean
    @Order(2)
    public SecurityFilterChain mainFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(c -> c.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(antMatcher(HttpMethod.OPTIONS, "/**")).permitAll()
                .requestMatchers(
                        antMatcher(HttpMethod.GET, "/actuator/health"),
                        antMatcher(HttpMethod.GET, "/actuator/health/**")).permitAll()
                .requestMatchers(
                        antMatcher(HttpMethod.GET, "/"),
                        antMatcher(HttpMethod.GET, "/index.html"),
                        antMatcher(HttpMethod.GET, "/favicon.ico"),
                        antMatcher(HttpMethod.GET, "/assets/**"),
                        antMatcher(HttpMethod.GET, "/static/**"),
                        antMatcher(HttpMethod.GET, "/team"),
                        antMatcher(HttpMethod.GET, "/team/**"),
                        antMatcher(HttpMethod.GET, "/projects"),
                        antMatcher(HttpMethod.GET, "/projects/**"),
                        antMatcher(HttpMethod.GET, "/contact"),
                        antMatcher(HttpMethod.GET, "/aboutus"),
                        antMatcher(HttpMethod.GET, "/exchange"),
                        antMatcher(HttpMethod.GET, "/login"),
                        antMatcher(HttpMethod.GET, "/join"),
                        antMatcher(HttpMethod.GET, "/join/**"),
                        antMatcher(HttpMethod.GET, "/admin"),
                        antMatcher(HttpMethod.GET, "/admin/**"),
                        antMatcher(HttpMethod.GET, "/portal"),
                        antMatcher(HttpMethod.GET, "/portal/**")).permitAll()
                .requestMatchers(
                        antMatcher(HttpMethod.GET, "/api/v1/professor"),
                        antMatcher(HttpMethod.GET, "/api/v1/members/**"),
                        antMatcher(HttpMethod.GET, "/api/v1/projects/**"),
                        antMatcher(HttpMethod.GET, "/api/v1/publications/**"),
                        antMatcher(HttpMethod.GET, "/api/v1/areas"),
                        antMatcher(HttpMethod.GET, "/api/v1/graph"),
                        antMatcher(HttpMethod.GET, "/api/v1/export"),
                        antMatcher(HttpMethod.GET, "/uploads/**")).permitAll()
                .requestMatchers(antMatcher("/api/v1/admin/**")).hasAuthority("MANAGER")
                .requestMatchers(antMatcher("/api/v1/me/**")).hasAnyAuthority("MEMBER", "MANAGER")
                .anyRequest().authenticated()
            )
            // Response hardening headers.
            //
            // nginx.conf already sets these, but nginx only exists in the
            // docker-compose topology. Render runs the monolith Dockerfile where
            // Spring Boot serves the SPA itself, so that config never executes and
            // production was running with Spring Security's defaults alone (nosniff
            // + X-Frame-Options, no CSP). Setting them here covers both deployments;
            // duplicated headers behind nginx are identical values, not a conflict.
            //
            // script-src needs 'unsafe-inline': TanStack Start ships the prerendered
            // route/hydration payload as inline <script> blocks, so a bare
            // "script-src 'self'" blocks hydration and the SPA renders a white page.
            // (nginx.conf carried that stricter value, but nginx never serves this
            // app in production, so the policy was never exercised there.)
            //
            // Being straight about the trade-off: with 'unsafe-inline' and no nonce,
            // script-src stops almost nothing. The directives that still carry weight
            // here are frame-ancestors (clickjacking), base-uri and form-action
            // (injection-driven redirection), object-src, and connect-src. Tightening
            // script-src properly means emitting a per-request nonce into the HTML,
            // which needs a response filter — worth doing, but not while the site is
            // down. img-src allows data: for the photo editor's canvas previews and
            // https: for Cloudinary-hosted uploads.
            .headers(h -> h
                    .contentSecurityPolicy(csp -> csp.policyDirectives(
                            "default-src 'self'; "
                            + "script-src 'self' 'unsafe-inline'; "
                            + "style-src 'self' 'unsafe-inline'; "
                            + "img-src 'self' data: https:; "
                            + "font-src 'self' data:; "
                            + "connect-src 'self'; "
                            + "object-src 'none'; "
                            + "frame-ancestors 'none'; "
                            + "base-uri 'self'; "
                            + "form-action 'self'"))
                    .referrerPolicy(r -> r.policy(
                            org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter
                                    .ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                    .permissionsPolicyHeader(p -> p.policy(
                            "camera=(), microphone=(), geolocation=()"))
            )
            // Custom 401 body — also doubles as a deploy verification marker. If after pushing
            // this commit you still see `"unauthenticated"` (no v3 suffix), Render is serving
            // a stale image and the deploy did not actually pick up your code.
            .exceptionHandling(e -> e.authenticationEntryPoint((req, res, ex) -> {
                res.setStatus(jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED);
                res.setContentType("application/json");
                res.getWriter().write("{\"code\":\"unauthenticated_v3\",\"message\":\"" + ex.getMessage() + "\"}");
            }))
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Suppress Spring Boot's default user + generated password.
     *
     * Without this bean, UserDetailsServiceAutoConfiguration kicks in, registers
     * an InMemoryUserDetailsManager with username "user" and a random UUID
     * password, and prints that password to the startup log:
     *
     *   "Using generated security password: <uuid>"
     *
     * That account would then be valid against any AuthenticationManager-backed
     * code path (HTTP Basic, future Actuator endpoints, etc.) — a real
     * credential disclosure via logs. We auth exclusively through JwtAuthFilter,
     * so registering an empty UserDetailsService that refuses every lookup is
     * the right answer.
     */
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> {
            throw new UsernameNotFoundException(
                    "LAPS authenticates via JwtAuthFilter; no UserDetailsService is wired."
            );
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        // setAllowedOriginPatterns (not setAllowedOrigins) is the API that works with
        // allowCredentials=true AND supports wildcards like http://localhost:*.
        cfg.setAllowedOriginPatterns(Arrays.asList(allowedOriginsRaw.split(",")));
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setExposedHeaders(List.of("Authorization", "Set-Cookie"));
        cfg.setAllowCredentials(true);
        cfg.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", cfg);
        return src;
    }
}
