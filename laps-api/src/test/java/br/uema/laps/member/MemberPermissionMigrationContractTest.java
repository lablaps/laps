package br.uema.laps.member;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;

class MemberPermissionMigrationContractTest {

    @Test
    @DisplayName("V31 migrates legacy leadership roles before removing them from the public taxonomy")
    void migrationPreservesAccessAndRestoresVisibleRoles() throws IOException {
        String sql = resource("/db/migration/V31__separate_member_roles_from_permissions.sql");

        assertThat(sql)
                .contains("CREATE TABLE member_permission")
                .contains("ON COMMIT DROP")
                .contains("MANAGE_PLATFORM")
                .contains("ADVISE_PROJECTS")
                .contains("member_role IN ('MANAGER', 'COORDINATOR')")
                .contains("COALESCE(previous_role.member_role, 'COLLABORATOR')")
                .contains("DELETE FROM invite_tokens")
                .contains("role IN ('MANAGER', 'COORDINATOR')");
    }

    private static String resource(String path) throws IOException {
        try (var input = MemberPermissionMigrationContractTest.class.getResourceAsStream(path)) {
            assertThat(input).as("classpath resource %s", path).isNotNull();
            return new String(input.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
