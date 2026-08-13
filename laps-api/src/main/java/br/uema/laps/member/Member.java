package br.uema.laps.member;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

// Entity contract: /home/user/ICARO/Icaro de Jesus/01-projects/laps/laps-data-model.md
@Entity
@Table(name = "member")
@Getter
@Setter
@NoArgsConstructor
public class Member {

    @Id
    @GeneratedValue
    private UUID id;

    @NotBlank
    @Column(unique = true, nullable = false)
    private String slug;

    @NotBlank
    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(unique = true)
    private String email;

    @Column(name = "password_hash")
    @JsonIgnore
    private String passwordHash;

    @JsonIgnore
    @Column(name = "must_change_password", nullable = false)
    private boolean mustChangePassword = true;

    @JsonIgnore
    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified = false;

    @JsonIgnore
    @Column(name = "email_verification_token")
    private String emailVerificationToken;

    @JsonIgnore
    @Column(name = "email_verification_token_expires_at")
    private Instant emailVerificationTokenExpiresAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "member_role", nullable = false)
    private MemberRole currentRole;

    @Column(name = "current_role_started_at")
    private LocalDate currentRoleStartedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MemberStatus status = MemberStatus.ACTIVE;

    @Column(name = "bio_pt", columnDefinition = "text")
    private String bioPt;
    @Column(name = "bio_en", columnDefinition = "text")
    private String bioEn;
    @Column(name = "bio_fr", columnDefinition = "text")
    private String bioFr;

    @Column(name = "photo_url", columnDefinition = "text")
    private String photoUrl;
    @Column(name = "linkedin_url")
    private String linkedinUrl;
    @Column(name = "lattes_url")
    private String lattesUrl;
    @Column(name = "github_url")
    private String githubUrl;
    @Column(name = "contact_email")
    private String contactEmail;

    /** One member-curated link — personal site, ORCID, ResearchGate, portfolio. */
    @Column(name = "custom_url", length = 500)
    private String customUrl;
    /** Link text for {@link #customUrl}; the UI falls back to a generic caption when blank. */
    @Column(name = "custom_url_label", length = 60)
    private String customUrlLabel;

    // Per-field public visibility, enforced server-side in MemberPublicView.
    //
    // Links default visible — they are published on purpose. The login email
    // defaults HIDDEN: it is a credential identifier, and members opt in to
    // publishing it rather than opting out. Must match V19's column defaults,
    // which govern rows this constructor never touches.
    @Column(name = "show_email", nullable = false)
    private boolean showEmail = false;
    @Column(name = "show_contact_email", nullable = false)
    private boolean showContactEmail = true;
    @Column(name = "show_linkedin", nullable = false)
    private boolean showLinkedin = true;
    @Column(name = "show_lattes", nullable = false)
    private boolean showLattes = true;
    @Column(name = "show_github", nullable = false)
    private boolean showGithub = true;
    @Column(name = "show_custom_url", nullable = false)
    private boolean showCustomUrl = true;

    @Column(columnDefinition = "text")
    private String roadmap;

    @Column(columnDefinition = "text")
    private String areas;

    @Column(columnDefinition = "text")
    private String interests;

    @Column(name = "banner_color", length = 50)
    private String bannerColor;

    @Column(name = "banner_image_url", columnDefinition = "text")
    private String bannerImageUrl;

    @Column(name = "exchange_country", length = 10)
    private String exchangeCountry;

    /**
     * Which bachelor's course the member came through. Independent of
     * {@link #currentRole} — see {@link UndergradProgram}. Null when unknown.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "undergrad_program", length = 40)
    private UndergradProgram undergradProgram;

    // JSON array of {code, level} objects — see languages-data.ts for schema.
    @Column(name = "languages", columnDefinition = "text")
    private String languages;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    void touch() {
        this.updatedAt = Instant.now();
    }
}
