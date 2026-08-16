package br.uema.laps.web;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.http.server.PathContainer;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.util.pattern.PathPattern;
import org.springframework.web.util.pattern.PathPatternParser;

import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Regression cover for invite links returning 401.
 *
 * <p>{@code /join/<token>} was a real route in the SPA
 * (laps-signal-lab/src/routes/join.$token.tsx) but was never added to
 * {@link SpaController}. With no handler mapped, Spring 404s the request and
 * dispatches it to /error — and because the security filter chain also runs on
 * the ERROR dispatch, /error fell through to {@code anyRequest().authenticated()}
 * and the response came back as {@code {"code":"unauthenticated_v3"}}. The
 * permit rule for GET /join/** in SecurityConfig was present the whole time and
 * could do nothing about it, which is what made the failure so confusing.
 *
 * <p>Asserting on the mapping rather than through MockMvc keeps this a plain
 * unit test — the rest of the suite has no Spring context either — while still
 * failing for exactly the reason the bug existed: a SPA route with no server
 * mapping.
 */
class SpaControllerRouteTest {

    private static final List<PathPattern> MAPPED = mappedPatterns();

    @DisplayName("every SPA deep link is forwarded to the shell")
    @ParameterizedTest(name = "{0}")
    @ValueSource(strings = {
            "/",
            "/team",
            "/team/6e2c5d66-848e-4757-9092-910d0e9e15c1",
            "/projects",
            "/projects/anything",
            "/contact",
            "/aboutus",
            "/exchange",
            "/login",
            // The one that was missing. A v4 UUID, the shape InviteController mints.
            "/join/6e2c5d66-848e-4757-9092-910d0e9e15c1",
            "/admin",
            "/admin/members",
            "/portal",
            "/portal/publications",
    })
    void forwardsSpaRoutes(String path) {
        assertThat(matchesSpaMapping(path))
                .as("%s has no SpaController mapping, so it 404s into /error and answers 401", path)
                .isTrue();
    }

    @Test
    @DisplayName("the shell fallback does not swallow API, upload or actuator paths")
    void doesNotSwallowServerPaths() {
        assertThat(matchesSpaMapping("/api/v1/members")).isFalse();
        assertThat(matchesSpaMapping("/api/v1/invites/6e2c5d66-848e-4757-9092-910d0e9e15c1")).isFalse();
        assertThat(matchesSpaMapping("/uploads/photo.jpg")).isFalse();
        assertThat(matchesSpaMapping("/actuator/health")).isFalse();
    }

    private static boolean matchesSpaMapping(String path) {
        PathContainer parsed = PathContainer.parsePath(path);
        return MAPPED.stream().anyMatch(pattern -> pattern.matches(parsed));
    }

    private static List<PathPattern> mappedPatterns() {
        GetMapping mapping;
        try {
            mapping = SpaController.class
                    .getMethod("forward", HttpServletRequest.class)
                    .getAnnotation(GetMapping.class);
        } catch (NoSuchMethodException e) {
            throw new IllegalStateException("SpaController.forward(HttpServletRequest) no longer exists", e);
        }
        PathPatternParser parser = new PathPatternParser();
        return Arrays.stream(mapping.value()).map(parser::parse).toList();
    }
}
