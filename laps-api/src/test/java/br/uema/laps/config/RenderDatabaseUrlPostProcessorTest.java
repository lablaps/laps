package br.uema.laps.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * The invariant under test: no database password may survive into a string this
 * class produces. {@code DATABASE_URL} carries the password in its userinfo
 * section, and the only caller of {@link RenderDatabaseUrlPostProcessor#redactCredentials}
 * is the failure path that throws during environment preparation — so whatever
 * it returns lands in the startup log and in Render's retained log stream.
 */
class RenderDatabaseUrlPostProcessorTest {

    @Test
    @DisplayName("redacts the password from Render's connection-string format")
    void redactsRenderConnectionString() {
        assertThat(RenderDatabaseUrlPostProcessor.redactCredentials(
                "postgresql://laps:sup3rS3cret@dpg-abc.oregon-postgres.render.com/lapsnew"))
                .isEqualTo("postgresql://laps:***@dpg-abc.oregon-postgres.render.com/lapsnew")
                .doesNotContain("sup3rS3cret");
    }

    @Test
    @DisplayName("redacts a password containing an unencoded @, which is what makes URI parsing fail")
    void redactsPasswordContainingAtSign() {
        assertThat(RenderDatabaseUrlPostProcessor.redactCredentials(
                "postgresql://laps:p@ss:w0rd@host:5432/db"))
                .isEqualTo("postgresql://laps:***@host:5432/db")
                .doesNotContain("w0rd");

        assertThat(RenderDatabaseUrlPostProcessor.redactCredentials(
                "postgresql://laps:tricky@pw@host/db"))
                .doesNotContain("tricky")
                .doesNotContain("pw@host/db".substring(0, 2));
    }

    @Test
    @DisplayName("leaves URLs without a password untouched")
    void leavesCredentialFreeUrlsAlone() {
        assertThat(RenderDatabaseUrlPostProcessor.redactCredentials("postgresql://host/db"))
                .isEqualTo("postgresql://host/db");
        assertThat(RenderDatabaseUrlPostProcessor.redactCredentials("postgresql://user@host:5432/db"))
                .isEqualTo("postgresql://user@host:5432/db");
        assertThat(RenderDatabaseUrlPostProcessor.redactCredentials("jdbc:postgresql://laps-db:5432/lapsnew"))
                .isEqualTo("jdbc:postgresql://laps-db:5432/lapsnew");
    }

    @Test
    @DisplayName("does not blow up on values that are not URLs at all")
    void toleratesMalformedInput() {
        assertThat(RenderDatabaseUrlPostProcessor.redactCredentials("not a url at all"))
                .isEqualTo("not a url at all");
        assertThat(RenderDatabaseUrlPostProcessor.redactCredentials("://")).isEqualTo("://");
        assertThat(RenderDatabaseUrlPostProcessor.redactCredentials("")).isEmpty();
    }

    @Test
    @DisplayName("handles a host-only authority with no trailing path")
    void handlesAuthorityWithoutPath() {
        assertThat(RenderDatabaseUrlPostProcessor.redactCredentials("postgresql://laps:secret@host"))
                .isEqualTo("postgresql://laps:***@host")
                .doesNotContain("secret");
    }
}
