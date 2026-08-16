package br.uema.laps;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.context.TestPropertySource;
import org.springframework.web.context.WebApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Does the application still wire up?
 *
 * <p>Every other test in this module is a plain Mockito unit test — they build
 * their subject with {@code new} and never start Spring. That is fast and it is
 * why they say nothing at all about an upgrade: the suite passed green on
 * Spring Boot 3.4.0 and on 3.5.16 without ever proving that either version can
 * construct the context. A framework bump breaks autoconfiguration, security
 * DSLs and starter defaults — none of which a mocked controller can notice.
 * The first thing that would have found out was the deploy.
 *
 * <p>So this test exists to fail on exactly that class of change: bean wiring,
 * the security filter chain, property binding, and the servlet layer.
 *
 * <p>It runs on in-memory H2 rather than no database at all. That was not the
 * first choice — the startup runners ({@code BootstrapAdminRunner},
 * {@code MemberPasswordBackfill}) are {@code @Transactional}, so the proxy opens
 * a connection before their first statement, and they execute under
 * {@code @SpringBootTest}. A context with no reachable database therefore cannot
 * start, mocked repositories or not.
 *
 * <p>What that costs is worth stating plainly: the schema here is generated from
 * the entity mappings, so this proves nothing about the Flyway migrations. Those
 * are still only proven by running them against a real Postgres.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@TestPropertySource(properties = {
        // Required by the app, which refuses to start without a secret — by design.
        "laps.jwt.secret=test-secret-value-at-least-32-characters-long",
        "laps.cors.allowed-origins=http://localhost",
        // In-memory H2 standing in for Postgres, with the schema built from the
        // entities. Flyway is off: its migrations are Postgres-specific.
        // MODE=PostgreSQL narrows the dialect gap; NON_KEYWORDS=YEAR is needed
        // because `year` is reserved in H2 and two entities use it as a column.
        "spring.datasource.url=jdbc:h2:mem:laps-context-smoke;DB_CLOSE_DELAY=-1"
                + ";MODE=PostgreSQL;NON_KEYWORDS=YEAR",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.flyway.enabled=false",
        // Blank bootstrap fields are what make BootstrapAdminRunner a no-op, so
        // this test never provisions an account.
        "laps.bootstrap.email=",
        "laps.bootstrap.password="
})
class ApplicationContextSmokeTest {

    @Autowired
    private WebApplicationContext context;

    @Test
    @DisplayName("the application context starts")
    void contextLoads() {
        assertThat(context).isNotNull();
    }

    @Test
    @DisplayName("the security filter chain is built — the control every authorization rule sits behind")
    void securityChainIsWired() {
        // Named explicitly because the failure mode that motivated the upgrade
        // was a filter chain that silently stopped applying. A context that
        // starts without one is the shape of that bug.
        assertThat(context.getBeansOfType(SecurityFilterChain.class)).isNotEmpty();
    }
}
