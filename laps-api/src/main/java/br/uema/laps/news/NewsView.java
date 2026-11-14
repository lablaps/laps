package br.uema.laps.news;

import br.uema.laps.member.Member;
import br.uema.laps.member.MemberRole;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * The public shape of a news card.
 *
 * <p>{@link Person} carries only what the public roster already shows — name,
 * slug, photo, role. It is built from Member explicitly rather than by
 * serialising the entity, so a field added to Member later (an email, a
 * visibility flag) cannot leak through the news feed by accident.
 */
public record NewsView(
        UUID id,
        Text title,
        Text subtitle,
        String imageUrl,
        String linkUrl,
        LocalDate publishedOn,
        List<NewsCategory> categories,
        List<String> tags,
        List<Person> people,
        Instant createdAt,
        Instant updatedAt
) {
    public record Text(String pt, String en, String fr) {}

    public record Person(UUID id, String slug, String fullName, String photoUrl, MemberRole currentRole) {
        static Person of(Member m) {
            return new Person(m.getId(), m.getSlug(), m.getFullName(), m.getPhotoUrl(), m.getCurrentRole());
        }
    }
}
