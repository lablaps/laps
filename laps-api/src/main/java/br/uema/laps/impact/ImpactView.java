package br.uema.laps.impact;

import java.time.Instant;
import java.util.UUID;

public record ImpactView(UUID id, UUID memberId, String memberName, String memberSlug,
                         ImpactInput details, Instant createdAt, Instant updatedAt) {
    static ImpactView of(Impact impact) {
        var member = impact.getMember();
        return new ImpactView(impact.getId(), member.getId(), member.getFullName(), member.getSlug(),
                impact.getDetails(), impact.getCreatedAt(), impact.getUpdatedAt());
    }
}
