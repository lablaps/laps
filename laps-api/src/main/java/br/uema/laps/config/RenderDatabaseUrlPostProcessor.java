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

            // DB_SSLMODE was ignored here: the mode was hardcoded to `require`,
            // so render.yaml's DB_SSLMODE setting did nothing and there was no
            // way to move this deployment to `verify-full` at all. `require`
            // encrypts but performs no certificate validation, which stops
            // passive interception and not an active man-in-the-middle.
            //
            // Default stays `require` so behaviour is unchanged for anyone who
            // has not set it; raising it to verify-full additionally needs a CA
            // bundle on the client, which is why it is not the default here.
            String sslMode = env.getProperty("DB_SSLMODE", "require");
            String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + db + "?sslmode=" + sslMode;

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
            // Neither the URL nor the original exception may be echoed here.
            // DATABASE_URL carries the database password in its userinfo section,
            // this runs during environment preparation (so the throw lands in the
            // startup log and in Render's retained log stream), and
            // URISyntaxException embeds the offending input in its own message —
            // attaching it as a cause would leak the password through the stack
            // trace even if this message did not. The exception type plus the
            // redacted URL is enough to tell a malformed URL from a missing one.
            throw new IllegalStateException(
                    "Failed to parse DATABASE_URL (" + e.getClass().getSimpleName() + "): "
                            + redactCredentials(databaseUrl));
        }
    }

    /**
     * Replaces the password in a {@code scheme://user:pass@host} URL with
     * {@code ***}, leaving every other part intact so the value stays
     * diagnosable. A URL with no userinfo is returned unchanged.
     *
     * <p>Scans to the <b>last</b> {@code @} in the authority rather than the
     * first. A password containing an unencoded {@code @} is precisely what
     * makes {@code new URI(...)} throw and land us in the catch block above, so
     * stopping at the first {@code @} would leak the tail of the one password
     * this method exists to hide.
     */
    static String redactCredentials(String url) {
        int schemeEnd = url.indexOf("://");
        if (schemeEnd < 0) return url;

        int authorityStart = schemeEnd + 3;
        int authorityEnd = url.indexOf('/', authorityStart);
        if (authorityEnd < 0) authorityEnd = url.length();

        int at = url.lastIndexOf('@', authorityEnd - 1);
        if (at < authorityStart) return url;            // no userinfo at all

        int colon = url.indexOf(':', authorityStart);
        if (colon < 0 || colon > at) return url;        // username, but no password

        return url.substring(0, colon + 1) + "***" + url.substring(at);
    }
}
