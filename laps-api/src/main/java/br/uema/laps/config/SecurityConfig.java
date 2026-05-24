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
                // CORS preflight must succeed before the actual request — leaving it
                // to the authorization chain caused 403s on PUT /admin/** because the
                // OPTIONS probe has no Authorization header / JWT cookie attached.
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // Only the health probe is public; every other actuator endpoint
                // stays disabled in application.yml so this allow-list can never
                // surface info-leaks like /env or /heapdump.
                .requestMatchers(HttpMethod.GET, "/actuator/health", "/actuator/health/**").permitAll()
                // SPA shell + bundled assets. Monolith deploy: dist/client/* is
                // copied into src/main/resources/static/ at build time, then served
                // here. Any non-API GET path is fair game.
                .requestMatchers(HttpMethod.GET,
                        "/", "/index.html", "/favicon.ico",
                        "/assets/**", "/static/**",
                        "/team", "/team/**", "/projects", "/projects/**",
                        "/contact", "/aboutus", "/exchange",
                        "/login",
                        "/admin", "/admin/**",
                        "/portal", "/portal/**").permitAll()
                .requestMatchers(HttpMethod.GET,
                        "/api/v1/professor", "/api/v1/members/**",
                        "/api/v1/projects/**",
                        "/api/v1/publications/**", "/api/v1/areas",
                        "/api/v1/graph", "/api/v1/export",
                        "/uploads/**").permitAll()
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/api/v1/admin/**").hasAuthority("MANAGER")
                .requestMatchers("/api/v1/me/**").hasAnyAuthority("MEMBER", "MANAGER")
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
