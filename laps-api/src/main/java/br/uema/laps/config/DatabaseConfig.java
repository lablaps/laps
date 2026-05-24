package br.uema.laps.config;

import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.net.URI;

/**
 * Converts Render's {@code DATABASE_URL} (URI format: {@code postgresql://user:pass@host:port/db})
 * into the JDBC format that HikariCP / PostgreSQL driver expects
 * ({@code jdbc:postgresql://host:port/db} + separate username/password).
 *
 * <p>If DATABASE_URL is absent or already starts with {@code jdbc:}, this is a no-op.
 */
@Configuration
public class DatabaseConfig {

    private final DataSourceProperties dsProps;

    public DatabaseConfig(DataSourceProperties dsProps) {
        this.dsProps = dsProps;
    }

    @PostConstruct
    void convertRenderUrl() {
        String url = dsProps.getUrl();
        if (url == null || url.startsWith("jdbc:")) {
            return; // nothing to convert
        }

        try {
            // Render gives: postgresql://user:pass@host[:port]/dbname
            URI uri = new URI(url);
            String host = uri.getHost();
            int port = uri.getPort() > 0 ? uri.getPort() : 5432;
            String db = uri.getPath().substring(1); // strip leading /
            String query = uri.getQuery();

            String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + db;
            if (query != null && !query.isEmpty()) {
                jdbcUrl += "?" + query;
            } else {
                jdbcUrl += "?sslmode=require";
            }
            dsProps.setUrl(jdbcUrl);

            // Extract user:password from the userInfo part
            String userInfo = uri.getUserInfo();
            if (userInfo != null && userInfo.contains(":")) {
                String[] parts = userInfo.split(":", 2);
                dsProps.setUsername(parts[0]);
                dsProps.setPassword(parts[1]);
            }
        } catch (Exception e) {
            throw new IllegalStateException(
                    "Failed to parse DATABASE_URL: " + url, e);
        }
    }
}
