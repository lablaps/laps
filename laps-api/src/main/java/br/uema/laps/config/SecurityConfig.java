package br.uema.laps.config;

import br.uema.laps.security.JwtAuthFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(c -> c.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // All matchers are forced to AntPathRequestMatcher (via antMatcher(...)) instead
                // of letting Spring Security 6.x pick MvcRequestMatcher by default. MvcRequestMatcher
                // only matches paths that resolve to a Spring MVC handler, so any pattern that
                // covers anonymous endpoints (invites, auth/login) silently fails to match when the
                // request hasn't been routed yet — falling through to anyRequest().authenticated()
                // and returning 401 on public endpoints. AntPathRequestMatcher matches purely on
                // the URL pattern, which is what we want for an auth chain.
                .requestMatchers(antMatcher(HttpMethod.OPTIONS, "/**")).permitAll()
                // Only the health probe is public; every other actuator endpoint
                // stays disabled in application.yml so this allow-list can never
                // surface info-leaks like /env or /heapdump.
                .requestMatchers(
                        antMatcher(HttpMethod.GET, "/actuator/health"),
                        antMatcher(HttpMethod.GET, "/actuator/health/**")).permitAll()
                // SPA shell + bundled assets. Monolith deploy: dist/client/* is
                // copied into src/main/resources/static/ at build time, then served
                // here. Any non-API GET path is fair game.
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
                .requestMatchers(antMatcher("/api/v1/auth/**")).permitAll()
                .requestMatchers(antMatcher(HttpMethod.GET, "/api/v1/invites/**")).permitAll()
                .requestMatchers(antMatcher(HttpMethod.POST, "/api/v1/invites/**")).permitAll()
                .requestMatchers(antMatcher("/api/v1/admin/**")).hasAuthority("MANAGER")
                .requestMatchers(antMatcher("/api/v1/me/**")).hasAnyAuthority("MEMBER", "MANAGER")
                .anyRequest().authenticated()
            )
            // Unauthenticated requests to protected endpoints get 401 (not the default
            // 403), so the SPA can distinguish "log back in" from "you lack the role".
            .exceptionHandling(e -> e.authenticationEntryPoint((req, res, ex) -> {
                res.setStatus(jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED);
                res.setContentType("application/json");
                res.getWriter().write("{\"code\":\"unauthenticated\",\"message\":\"" + ex.getMessage() + "\"}");
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
