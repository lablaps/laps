package br.uema.laps.member;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.LockModeType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

import org.springframework.data.jpa.repository.Lock;

import static org.assertj.core.api.Assertions.assertThat;

class MemberAuthVersionMigrationContractTest {

    @Test
    @DisplayName("V33 adds a non-null, nonnegative authentication version for every member")
    void migrationAddsAuthenticationVersion() throws Exception {
        String sql = resource("/db/migration/V33__member_auth_version.sql");

        assertThat(sql)
                .contains("auth_version BIGINT NOT NULL DEFAULT 0")
                .contains("CHECK (auth_version >= 0)");

        var field = Member.class.getDeclaredField("authVersion");
        Column column = field.getAnnotation(Column.class);
        assertThat(column).isNotNull();
        assertThat(column.name()).isEqualTo("auth_version");
        assertThat(column.nullable()).isFalse();
        assertThat(field.getAnnotation(JsonIgnore.class)).isNotNull();
        assertThat(new Member().getAuthVersion()).isZero();
    }

    @Test
    @DisplayName("credential mutations can lock the member row before incrementing its version")
    void repositoryExposesPasswordMutationLock() throws Exception {
        var method = MemberRepository.class.getDeclaredMethod("findByIdForUpdate", UUID.class);

        assertThat(method.getAnnotation(Lock.class))
                .isNotNull()
                .extracting(Lock::value)
                .isEqualTo(LockModeType.PESSIMISTIC_WRITE);
    }

    private static String resource(String path) throws IOException {
        try (var input = MemberAuthVersionMigrationContractTest.class.getResourceAsStream(path)) {
            assertThat(input).as("classpath resource %s", path).isNotNull();
            return new String(input.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
