package br.uema.laps;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * The Impacts feature was removed on 2026-11-14: prizes and scholarships are
 * news items tagged AWARD or SCHOLARSHIP (V34), not a separate record type.
 * These pin that the removal is complete — code and table — so a partial
 * revert cannot bring back an endpoint writing to a table that no longer
 * exists, or a table no code reads.
 */
class ImpactRemovalContractTest {

    @Test
    @DisplayName("V35 drops the impact table")
    void migrationDropsTable() throws IOException {
        String sql;
        try (var in = ImpactRemovalContractTest.class.getResourceAsStream("/db/migration/V35__drop_impact.sql")) {
            assertThat(in).as("V35 migration on the classpath").isNotNull();
            sql = new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
        assertThat(sql).contains("DROP TABLE IF EXISTS impact");
    }

    @Test
    @DisplayName("no impact controller, service or entity is left on the classpath")
    void codeIsGone() {
        for (String name : new String[] {
                "br.uema.laps.impact.ImpactController",
                "br.uema.laps.impact.ImpactService",
                "br.uema.laps.impact.Impact"}) {
            assertThatThrownBy(() -> Class.forName(name)).as(name).isInstanceOf(ClassNotFoundException.class);
        }
    }
}
