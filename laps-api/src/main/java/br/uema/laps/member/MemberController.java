package br.uema.laps.member;

import br.uema.laps.security.AuthenticatedMember;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/members")
public class MemberController {

    private final MemberRepository memberRepository;

    public MemberController(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    @GetMapping
    public Page<MemberPublicView> list(
            @RequestParam(required = false) MemberRole role,
            @RequestParam(required = false) MemberStatus status,
            Pageable pageable
    ) {
        boolean includeHidden = isManager();
        return memberRepository.findAll(MemberSpecifications.build(role, status), pageable)
                .map(m -> MemberPublicView.of(m, includeHidden));
    }

    // Accepts either the public slug ("icaro-de-jesus-silva") or the raw UUID
    // primary key. The SPA links from /team to /team/<uuid> using the API id,
    // so a slug-only lookup 404s on every detail click.
    @GetMapping("/{slugOrId}")
    public ResponseEntity<MemberPublicView> get(@PathVariable String slugOrId) {
        boolean includeHidden = isManager();
        Optional<Member> found = memberRepository.findBySlug(slugOrId);
        if (found.isEmpty()) {
            try {
                found = memberRepository.findById(UUID.fromString(slugOrId));
            } catch (IllegalArgumentException notAUuid) {
                return ResponseEntity.notFound().build();
            }
        }
        return found
                .filter(m -> includeHidden || m.getDeletedAt() == null)
                .map(m -> ResponseEntity.ok(MemberPublicView.of(m, includeHidden)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * These endpoints are permitAll, so most callers are anonymous. JwtAuthFilter
     * still populates the SecurityContext when a valid cookie is present, and
     * AuthenticatedMember.role() degrades to "MEMBER" when it isn't — so an
     * unauthenticated request can never take the unredacted branch.
     *
     * Also gates soft-deleted members in {@link #get}: the list endpoint has
     * always filtered them via MemberSpecifications, but the by-slug lookup did
     * not, so a removed member's profile stayed retrievable at a stable URL.
     * Managers keep access so the admin UI can still work with the record.
     */
    private static boolean isManager() {
        return "MANAGER".equals(AuthenticatedMember.role());
    }
}
