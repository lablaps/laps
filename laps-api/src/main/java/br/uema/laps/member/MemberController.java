package br.uema.laps.member;

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
    public Page<Member> list(
            @RequestParam(required = false) MemberRole role,
            @RequestParam(required = false) MemberStatus status,
            Pageable pageable
    ) {
        return memberRepository.findAll(MemberSpecifications.build(role, status), pageable);
    }

    // Accepts either the public slug ("icaro-de-jesus-silva") or the raw UUID
    // primary key. The SPA links from /team to /team/<uuid> using the API id,
    // so a slug-only lookup 404s on every detail click.
    @GetMapping("/{slugOrId}")
    public ResponseEntity<Member> get(@PathVariable String slugOrId) {
        Optional<Member> bySlug = memberRepository.findBySlug(slugOrId);
        if (bySlug.isPresent()) return ResponseEntity.ok(bySlug.get());
        try {
            UUID id = UUID.fromString(slugOrId);
            return memberRepository.findById(id)
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (IllegalArgumentException notAUuid) {
            return ResponseEntity.notFound().build();
        }
    }
}
