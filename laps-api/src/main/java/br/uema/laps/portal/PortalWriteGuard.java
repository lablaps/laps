package br.uema.laps.portal;

import br.uema.laps.member.Member;
import br.uema.laps.member.MemberRepository;
import br.uema.laps.security.AuthenticatedMember;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

/**
 * Single definition of "this caller may not write yet".
 *
 * A member still holding the issued temp password has not proven they are the
 * person the credential was handed to — the password travelled out-of-band
 * (chat, phone) and may have been seen by someone else in transit. Until they
 * rotate it, every state-changing portal endpoint is closed to them; the only
 * thing they can do is change their password.
 *
 * This lived as a private method on MyPortalController and was applied to two
 * of its endpoints while the profile writer and both upload endpoints went
 * unguarded. Extracting it means new portal endpoints have one obvious thing
 * to call rather than a rule to remember.
 */
@Component
public class PortalWriteGuard {

    private final MemberRepository memberRepository;

    public PortalWriteGuard(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    /** Loads the caller and refuses if they still hold an unrotated temp password. */
    public Member requireRotatedPassword() {
        UUID myId = AuthenticatedMember.id();
        Member me = memberRepository.findById(myId)
                .orElseThrow(() -> new EntityNotFoundException("member not found: " + myId));
        check(me);
        return me;
    }

    /** Same rule, for callers that already hold the Member. */
    public void check(Member me) {
        if (me.isMustChangePassword()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You must change your temporary password before editing your profile");
        }
    }
}
