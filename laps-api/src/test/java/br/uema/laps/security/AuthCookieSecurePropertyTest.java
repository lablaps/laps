package br.uema.laps.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;
import org.springframework.mock.env.MockEnvironment;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

/**
 * Binding cover for {@code laps.auth.cookie-secure}.
 *
 * <p>The subtlety: application.yml declares the key as
 * {@code cookie-secure: ${LAPS_COOKIE_SECURE:}}, so when the environment
 * variable is unset the property is present-but-empty rather than absent. The
 * {@code :#{null}} default on the injection point therefore never fires, and the
 * whole three-state design (unset = derive from the request) depends on Spring
 * converting {@code ""} to a null Boolean instead of throwing. If that ever
 * stopped holding, the application would fail to start — on the deployment where
 * the variable is left blank, which is the local one, so it would be caught late.
 */
class AuthCookieSecurePropertyTest {

    @Configuration
    static class Config {
        @Bean
        static PropertySourcesPlaceholderConfigurer placeholders() {
            return new PropertySourcesPlaceholderConfigurer();
        }

        @Bean
        AuthCookies authCookies(@Value("${laps.auth.cookie-secure:#{null}}") Boolean forceSecure) {
            return new AuthCookies(Duration.ofHours(8), forceSecure);
        }
    }

    private static AuthCookies buildWith(String propertyValue) {
        MockEnvironment env = new MockEnvironment();
        if (propertyValue != null) {
            env.setProperty("laps.auth.cookie-secure", propertyValue);
        }
        try (AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext()) {
            ctx.setEnvironment(env);
            ctx.register(Config.class);
            ctx.refresh();
            return ctx.getBean(AuthCookies.class);
        }
    }

    @Test
    @DisplayName("an unset LAPS_COOKIE_SECURE (empty string) starts cleanly and defers to the request")
    void emptyStringBindsToAutoDetect() {
        assertThatCode(() -> buildWith("")).doesNotThrowAnyException();

        var request = new org.springframework.mock.web.MockHttpServletRequest();
        request.setSecure(false);
        assertThat(buildWith("").issue("x", request).isSecure()).isFalse();
        request.setSecure(true);
        assertThat(buildWith("").issue("x", request).isSecure()).isTrue();
    }

    @Test
    @DisplayName("an absent property behaves the same as an empty one")
    void absentPropertyBindsToAutoDetect() {
        var request = new org.springframework.mock.web.MockHttpServletRequest();
        request.setSecure(false);
        assertThat(buildWith(null).issue("x", request).isSecure()).isFalse();
    }

    @Test
    @DisplayName("an explicit true overrides a request that looks plaintext")
    void explicitTrueOverridesRequest() {
        var request = new org.springframework.mock.web.MockHttpServletRequest();
        request.setSecure(false);
        assertThat(buildWith("true").issue("x", request).isSecure()).isTrue();
    }
}
