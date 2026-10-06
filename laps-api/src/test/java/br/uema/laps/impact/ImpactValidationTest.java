package br.uema.laps.impact;

import jakarta.validation.Validation;
import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.IntStream;
import static org.assertj.core.api.Assertions.assertThat;

class ImpactValidationTest {
    @Test void rejectsElevenToolsAndFutureDates() {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            var text = new ImpactInput.Text("Título", "Title", "Titre");
            var input = new ImpactInput(ImpactKind.SCHOLARSHIP, LocalDate.now().plusDays(1),
                    text, text, text, text, "UEMA",
                    IntStream.range(0, 11).mapToObj(i -> "Tool " + i).toList(), List.of(), List.of(), List.of());
            assertThat(factory.getValidator().validate(input)).extracting(v -> v.getPropertyPath().toString())
                    .contains("tools", "occurredOn");
        }
    }
}
