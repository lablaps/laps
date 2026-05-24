package br.uema.laps.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

/**
 * Converts Render's {@code DATABASE_URL} (URI format:
 * {@code postgresql://user:pass@host[:port]/db}) into Spring Boot datasource
 * properties <b>before</b> any beans are created.
 *
 * <p>This runs as an {@link EnvironmentPostProcessor}, so it fires during
 * environment preparation — well before HikariCP or Flyway try to connect.
 */
public class RenderDatabaseUrlPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment env, SpringApplication app) {
        String databaseUrl = env.getProperty("DATABASE_URL");

        if (databaseUrl == null || databaseUrl.isBlank() || databaseUrl.startsWith("jdbc:")) {
            return; // nothing to convert
        }

        try {
            URI uri = new URI(databaseUrl);
            String host = uri.getHost();
            int port = uri.getPort() > 0 ? uri.getPort() : 5432;
            String db = uri.getPath().substring(1); // strip leading /

            String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + db + "?sslmode=require";

            Map<String, Object> props = new HashMap<>();
            props.put("spring.datasource.url", jdbcUrl);

            String userInfo = uri.getUserInfo();
            if (userInfo != null && userInfo.contains(":")) {
                String[] parts = userInfo.split(":", 2);
                props.put("spring.datasource.username", parts[0]);
                props.put("spring.datasource.password", parts[1]);
            }

            // High priority so it overrides application-prod.yml
            env.getPropertySources().addFirst(new MapPropertySource("renderDatabase", props));

        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse DATABASE_URL: " + databaseUrl, e);
        }
    }
}
