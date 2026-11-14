package br.uema.laps.news;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * The request-shape limits. They exist so a single request cannot store an
 * unbounded card: the public list renders every field of every item it pages.
 */
class NewsInputValidationTest {

    private ValidatorFactory factory;
    private Validator validator;

    @BeforeEach
    void setUp() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterEach
    void tearDown() {
        factory.close();
    }

    private static NewsInput valid() {
        return new NewsInput(
                new NewsInput.Title("Título", "Title", "Titre"),
                new NewsInput.Subtitle("Subtítulo", null, null),
                null, null, LocalDate.of(2026, 1, 1),
                Set.of(NewsCategory.AWARD), List.of("EEG"), List.of(UUID.randomUUID()));
    }

    private Set<String> violations(NewsInput input) {
        return validator.validate(input).stream()
                .map(v -> v.getPropertyPath().toString())
                .collect(java.util.stream.Collectors.toSet());
    }

    @Test
    @DisplayName("a well-formed request has no violations")
    void validInputPasses() {
        assertThat(violations(valid())).isEmpty();
    }

    @Test
    @DisplayName("the Portuguese title is required; the other languages fall back to it")
    void portugueseTitleRequired() {
        var v = valid();
        var input = new NewsInput(new NewsInput.Title(" ", "Title", null), v.subtitle(), null, null,
                v.publishedOn(), v.categories(), v.tags(), v.memberIds());

        assertThat(violations(input)).contains("title.pt");
    }

    @Test
    @DisplayName("news cannot be dated in the future — there is no scheduling, so it would just look wrong")
    void futureDateRejected() {
        var v = valid();
        var input = new NewsInput(v.title(), v.subtitle(), null, null,
                LocalDate.now().plusDays(1), v.categories(), v.tags(), v.memberIds());

        assertThat(violations(input)).contains("publishedOn");
    }

    @Test
    @DisplayName("tags, people and title length are capped")
    void listsAndLengthsCapped() {
        var v = valid();
        var input = new NewsInput(
                new NewsInput.Title("x".repeat(201), null, null), v.subtitle(), null, null, v.publishedOn(),
                v.categories(),
                IntStream.range(0, 13).mapToObj(i -> "tag" + i).toList(),
                IntStream.range(0, 31).mapToObj(i -> UUID.randomUUID()).toList());

        assertThat(violations(input)).contains("title.pt", "tags", "memberIds");
    }
}
