package br.uema.laps.member;

import br.uema.laps.member.MemberStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Read model for /api/v1/members — the only shape anonymous callers ever see.
 *
 * The members endpoints used to return the {@link Member} entity directly, which
 * published every column Jackson could reach (login email included) to anyone who
 * curled the URL. This view exists so the per-field visibility flags are enforced
 * where it counts: a member who hides their email must have it absent from the
 * JSON, not merely unrendered by the SPA.
 *
 * Managers get the unredacted variant because /admin lists and edits members
 * through this same public endpoint — see {@link #of(Member, boolean)}.
 */
public record MemberPublicView(
        UUID id,
        String slug,
        String fullName,
        String email,
        MemberRole currentRole,
        LocalDate currentRoleStartedAt,
        MemberStatus status,
        String bioPt,
        String bioEn,
        String bioFr,
        String photoUrl,
        String linkedinUrl,
        String lattesUrl,
        String githubUrl,
        String contactEmail,
        String customUrl,
        String customUrlLabel,
        String roadmap,
        String areas,
        String interests,
        String bannerColor,
        String bannerImageUrl,
        String exchangeCountry,
        UndergradProgram undergradProgram,
        String joinedSemester,
        String joinedMonth,
        String languages,
        boolean showEmail,
        boolean showContactEmail,
        boolean showLinkedin,
        boolean showLattes,
        boolean showGithub,
        boolean showCustomUrl,
        Instant deletedAt
) {

    /**
     * @param includeHidden when true, no redaction is applied. Reserved for
     *                      MANAGER callers — a coordinator has to be able to see
     *                      and correct a member's contact details even when the
     *                      member has hidden them from the public site.
     */
    public static MemberPublicView of(Member m, boolean includeHidden) {
        return new MemberPublicView(
                m.getId(),
                m.getSlug(),
                m.getFullName(),
                visible(m.getEmail(), m.isShowEmail(), includeHidden),
                m.getCurrentRole(),
                m.getCurrentRoleStartedAt(),
                m.getStatus(),
                m.getBioPt(),
                m.getBioEn(),
                m.getBioFr(),
                m.getPhotoUrl(),
                visible(m.getLinkedinUrl(), m.isShowLinkedin(), includeHidden),
                visible(m.getLattesUrl(), m.isShowLattes(), includeHidden),
                visible(m.getGithubUrl(), m.isShowGithub(), includeHidden),
                visible(m.getContactEmail(), m.isShowContactEmail(), includeHidden),
                visible(m.getCustomUrl(), m.isShowCustomUrl(), includeHidden),
                // The label is only meaningful alongside the URL it captions.
                visible(m.getCustomUrlLabel(), m.isShowCustomUrl(), includeHidden),
                m.getRoadmap(),
                m.getAreas(),
                m.getInterests(),
                m.getBannerColor(),
                m.getBannerImageUrl(),
                m.getExchangeCountry(),
                // Public: which course someone studies is roster information, not
                // contact data, so it carries no visibility flag.
                m.getUndergradProgram(),
                // Roster facts, like the program above — no visibility flag.
                m.getJoinedSemester(),
                m.getJoinedMonth(),
                m.getLanguages(),
                m.isShowEmail(),
                m.isShowContactEmail(),
                m.isShowLinkedin(),
                m.isShowLattes(),
                m.isShowGithub(),
                m.isShowCustomUrl(),
                m.getDeletedAt()
        );
    }

    private static String visible(String value, boolean shown, boolean includeHidden) {
        return (shown || includeHidden) ? value : null;
    }
}
