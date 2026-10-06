package br.uema.laps.impact;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.List;

public record ImpactInput(
        @NotNull ImpactKind kind,
        @NotNull @PastOrPresent LocalDate occurredOn,
        @NotNull @Valid Text title,
        @NotNull @Valid Text outcome,
        @NotNull @Valid Text contribution,
        @NotNull @Valid Text role,
        @Size(max = 200) String organization,
        @NotNull @Size(max = 10) List<@NotBlank @Size(max = 80) String> tools,
        @NotNull @Size(max = 50) List<@NotBlank @Size(max = 200) String> collaborators,
        @NotNull @Size(max = 10) List<@NotBlank @Size(max = 200) String> supervisors,
        @NotNull @Size(max = 20) List<@NotNull @Valid Evidence> evidence
) {
    public record Text(@NotBlank @Size(max = 3000) String pt,
                       @Size(max = 3000) String en, @Size(max = 3000) String fr) {}
    public record Evidence(@NotBlank @Size(max = 200) String title,
                           @NotBlank @Size(max = 2000) String url) {}
}
