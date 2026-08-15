package br.uema.laps.admin;

import br.uema.laps.audit.AuditLogRepository;
import br.uema.laps.audit.AuditService;
import br.uema.laps.member.Member;
import br.uema.laps.member.MemberRepository;
import br.uema.laps.project.MemberProjectRepository;
import br.uema.laps.project.ProjectRepository;
import br.uema.laps.publication.PublicationRepository;
import br.uema.laps.roletracking.RoleTransitionService;
import br.uema.laps.security.MemberPasswordService;
import br.uema.laps.translate.TranslationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Exchange placement is a country plus, inside Brazil, a UF. The two are edited
 * as separate fields but constrained as a pair by V26's CHECK, so the ordinary
 * edits have to reconcile them before the write reaches the database — a
 * constraint violation here would surface to a coordinator as an unexplained
 * failure.
 */
class AdminExchangePlacementTest {

    private static final UUID ID = UUID.randomUUID();

    private MemberRepository memberRepository;
    private AdminController controller;
    private Member member;

    @BeforeEach
    void setUp() {
        memberRepository = mock(MemberRepository.class);
        controller = new AdminController(
                memberRepository,
                mock(PublicationRepository.class),
                mock(ProjectRepository.class),
                mock(MemberProjectRepository.class),
                mock(RoleTransitionService.class),
                mock(AuditService.class),
                mock(AuditLogRepository.class),
                mock(TranslationService.class),
                mock(MemberPasswordService.class));

        member = new Member();
        member.setId(ID);
        when(memberRepository.findById(ID)).thenReturn(Optional.of(member));
        when(memberRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        UUID.randomUUID().toString(), null,
                        List.of(new SimpleGrantedAuthority("MANAGER"))));
    }

    /** Only the two exchange fields vary across these cases; everything else is null. */
    private Member update(String country, String state) {
        return controller.updateMember(ID, new AdminController.MemberUpdate(
                null, null, null, null, null, null, null, null, null, null, null, null,
                country, state, null, null, null, null));
    }

    @Test
    @DisplayName("a Brazilian placement keeps its state")
    void nationalPlacementKeepsState() {
        Member saved = update("BR", "SP");
        assertThat(saved.getExchangeCountry()).isEqualTo("BR");
        assertThat(saved.getExchangeState()).isEqualTo("SP");
    }

    @Test
    @DisplayName("a lower-case country code is normalised, so the DB CHECK still matches 'BR'")
    void countryCodeIsUpperCased() {
        Member saved = update("br", "ba");
        assertThat(saved.getExchangeCountry()).isEqualTo("BR");
        assertThat(saved.getExchangeState()).isEqualTo("BA");
    }

    @Test
    @DisplayName("moving someone abroad drops the now-meaningless state")
    void movingAbroadClearsState() {
        member.setExchangeCountry("BR");
        member.setExchangeState("SP");

        // Only the country is edited — the SPA does not send a state at all.
        Member saved = update("FR", null);

        assertThat(saved.getExchangeCountry()).isEqualTo("FR");
        assertThat(saved.getExchangeState()).isNull();
    }

    @Test
    @DisplayName("clearing the country clears the state with it")
    void clearingCountryClearsState() {
        member.setExchangeCountry("BR");
        member.setExchangeState("MG");

        Member saved = update("", null);

        assertThat(saved.getExchangeCountry()).isNull();
        assertThat(saved.getExchangeState()).isNull();
    }

    @Test
    @DisplayName("an unknown UF is a 400 naming the value, not a constraint violation")
    void unknownStateRejected() {
        assertThatThrownBy(() -> update("BR", "XX"))
                .hasMessageContaining("Unknown Brazilian state")
                .hasMessageContaining("XX");
    }

    @Test
    @DisplayName("a state sent alongside a non-Brazilian country is dropped, not stored")
    void stateOutsideBrazilIsDropped() {
        Member saved = update("PT", "SP");
        assertThat(saved.getExchangeCountry()).isEqualTo("PT");
        assertThat(saved.getExchangeState()).isNull();
    }

    @Test
    @DisplayName("an empty state clears it while the member stays in Brazil")
    void emptyStateClearsWithinBrazil() {
        member.setExchangeCountry("BR");
        member.setExchangeState("RJ");

        Member saved = update("BR", "");

        assertThat(saved.getExchangeCountry()).isEqualTo("BR");
        assertThat(saved.getExchangeState()).isNull();
    }
}
