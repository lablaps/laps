package br.uema.laps.roletracking;

import br.uema.laps.member.Member;
import br.uema.laps.member.MemberRepository;
import br.uema.laps.member.MemberRole;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
public class RoleTransitionService {

    // We used to enforce a strict promotion graph (UNDERGRAD→MASTER→DOCTORATE,
    // never sideways or downward). Lab leadership asked for a generic
    // "change role" capability instead — a member moving from DOCTORATE to
    // MASTER, or from COLLABORATOR to UNDERGRAD, is valid. The
    // RoleHistory entry still records every transition so the chronological
    // trail isn't lost. `force` is retained on the request for compatibility
    // but no longer gates anything.
    private final MemberRepository memberRepository;
    private final RoleHistoryRepository roleHistoryRepository;

    public RoleTransitionService(MemberRepository memberRepository, RoleHistoryRepository roleHistoryRepository) {
        this.memberRepository = memberRepository;
        this.roleHistoryRepository = roleHistoryRepository;
    }

    @Transactional
    public Member transition(TransitionRequest req, UUID managerId) {
        Member member = memberRepository.findById(req.memberId())
                .orElseThrow(() -> new EntityNotFoundException("member not found: " + req.memberId()));
        if (req.toRole() == null || !req.toRole().isAssignable()) {
            throw new IllegalRoleTransitionException(member.getCurrentRole(), req.toRole());
        }

        if (member.getCurrentRole() == req.toRole()) {
            return member; // idempotent — nothing to record
        }

        RoleHistory open = roleHistoryRepository.findByMemberIdAndEndedAtIsNull(member.getId())
                .orElse(null);
        if (open != null && open.getRole() == req.toRole()) {
            return member; // idempotent
        }
        if (open != null) {
            open.setEndedAt(req.effectiveDate());
            roleHistoryRepository.save(open);
        }

        RoleHistory next = new RoleHistory();
        next.setMemberId(member.getId());
        next.setRole(req.toRole());
        next.setStartedAt(req.effectiveDate());
        next.setReason(req.reason());
        next.setRecordedBy(managerId);
        roleHistoryRepository.save(next);

        member.setCurrentRole(req.toRole());
        member.setCurrentRoleStartedAt(req.effectiveDate());
        return memberRepository.save(member);
    }

    public record TransitionRequest(
            UUID memberId,
            MemberRole toRole,
            LocalDate effectiveDate,
            String reason,
            boolean force
    ) {}
}
