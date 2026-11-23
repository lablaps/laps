package br.uema.laps.news;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * What a manager submits to create or replace a news card. Shape limits live
 * here; the checks that need the database or URL parsing (people exist, links
 * are web links, images come from the lab's uploads) live in NewsService.
 *
 * <p>An update replaces the whole card — the console always sends every field —
 * so there is no "null means leave it alone" convention to get wrong.
 */
public record NewsInput(
        @NotNull @Valid Title title,
        @Valid Subtitle subtitle,
        @Size(max = 500) String imageUrl,
        @Size(max = 2000) String linkUrl,
        // No scheduling feature exists, so a future date would simply show as
        // news from the future.
        @NotNull @PastOrPresent LocalDate publishedOn,
        @NotNull Set<@NotNull NewsCategory> categories,
        @NotNull @Size(max = 12) List<@NotBlank @Size(max = 40) String> tags,
        @NotNull @Size(max = 30) List<@NotNull UUID> memberIds
) {
    public record Title(@NotBlank @Size(max = 200) String pt,
                        @Size(max = 200) String en,
                        @Size(max = 200) String fr) {}

    public record Subtitle(@Size(max = 400) String pt,
                           @Size(max = 400) String en,
                           @Size(max = 400) String fr) {}
}
