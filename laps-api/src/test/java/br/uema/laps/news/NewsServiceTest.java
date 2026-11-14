package br.uema.laps.news;

import br.uema.laps.audit.AuditService;
import br.uema.laps.member.Member;
import br.uema.laps.member.MemberRepository;
import br.uema.laps.member.MemberRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * News is published by managers and read by everyone, so the service is where
 * a bad request has to be stopped: anything it accepts is rendered on the
 * public site with the lab's name on it. The claims below are about what it
 * refuses (unknown people, non-web links, foreign image hosts) and about what
 * the public view may say about a person.
 */
class NewsServiceTest {

    private static final UUID MANAGER = UUID.randomUUID();

    private NewsRepository newsRepository;
    private MemberRepository memberRepository;
    private AuditService auditService;
    private NewsService service;

    private final List<Member> roster = new ArrayList<>();

    @BeforeEach
    void setUp() {
        newsRepository = mock(NewsRepository.class);
        memberRepository = mock(MemberRepository.class);
        auditService = mock(AuditService.class);
        service = new NewsService(newsRepository, memberRepository, auditService);

        when(newsRepository.save(any(News.class))).thenAnswer(inv -> {
            News n = inv.getArgument(0);
            if (n.getId() == null) n.setId(UUID.randomUUID());
            return n;
        });
        when(memberRepository.findAllById(any())).thenAnswer(inv -> {
            Collection<UUID> ids = inv.getArgument(0);
            return roster.stream().filter(m -> ids.contains(m.getId())).toList();
        });
    }

    private Member member(String name) {
        Member m = new Member();
        m.setId(UUID.randomUUID());
        m.setFullName(name);
        m.setSlug(name.toLowerCase().replace(' ', '-'));
        m.setCurrentRole(MemberRole.DOCTORATE);
        roster.add(m);
        return m;
    }

    private static NewsInput input(List<String> tags, List<UUID> people, String imageUrl, String linkUrl) {
        return new NewsInput(
                new NewsInput.Title("Bolsa CAPES para doutorado", null, null),
                new NewsInput.Subtitle("Resultado do edital 2026", null, null),
                imageUrl,
                linkUrl,
                LocalDate.of(2026, 3, 1),
                Set.of(NewsCategory.SCHOLARSHIP, NewsCategory.NATIONAL),
                tags,
                people);
    }

    private static NewsInput input(List<UUID> people) {
        return input(List.of("CAPES"), people, null, null);
    }

    @Test
    @DisplayName("creating news keeps the associated people in the order the manager gave them")
    void createKeepsPeopleOrder() {
        Member ana = member("Ana Souza");
        Member bruno = member("Bruno Lima");

        NewsView view = service.create(input(List.of(bruno.getId(), ana.getId())), MANAGER);

        assertThat(view.people()).extracting(NewsView.Person::fullName)
                .containsExactly("Bruno Lima", "Ana Souza");
    }

    @Test
    @DisplayName("tags are trimmed and deduplicated case-insensitively, the first spelling winning")
    void tagsAreNormalised() {
        NewsView view = service.create(
                input(List.of("  Machine   Learning ", "machine learning", "EEG", "eeg", "UEMA"), List.of(), null, null),
                MANAGER);

        assertThat(view.tags()).containsExactly("Machine Learning", "EEG", "UEMA");
    }

    @Test
    @DisplayName("a person listed twice is stored once")
    void duplicatePeopleCollapse() {
        Member ana = member("Ana Souza");

        NewsView view = service.create(input(List.of(ana.getId(), ana.getId())), MANAGER);

        assertThat(view.people()).hasSize(1);
    }

    @Test
    @DisplayName("naming someone who is not a member is a 400, not a foreign-key failure")
    void unknownPersonIsRejected() {
        UUID stranger = UUID.randomUUID();

        assertThatThrownBy(() -> service.create(input(List.of(stranger)), MANAGER))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);
        verify(newsRepository, never()).save(any());
    }

    @Test
    @DisplayName("a removed member cannot be attached to new news")
    void deletedPersonIsRejected() {
        Member gone = member("Gone Member");
        gone.setDeletedAt(Instant.now());

        assertThatThrownBy(() -> service.create(input(List.of(gone.getId())), MANAGER))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    @DisplayName("the external link must be an http(s) URL — javascript: and credentials-in-URL are refused")
    void externalLinkMustBeWeb() {
        for (String bad : List.of("javascript:alert(1)", "ftp://example.org/x", "https://user:pw@example.org", "not a url")) {
            assertThatThrownBy(() -> service.create(input(List.of(), List.of(), null, bad), MANAGER))
                    .as(bad)
                    .isInstanceOf(ResponseStatusException.class);
        }
        NewsView ok = service.create(input(List.of(), List.of(), null, "https://www.uema.br/noticia/1"), MANAGER);
        assertThat(ok.linkUrl()).isEqualTo("https://www.uema.br/noticia/1");
    }

    @Test
    @DisplayName("the image is either a lab upload or an https URL; path tricks and other schemes are refused")
    void imageMustComeFromUploadsOrHttps() {
        for (String bad : List.of("/uploads/../application.yml", "/etc/passwd", "http://insecure.example/x.jpg", "data:image/png;base64,AAAA")) {
            assertThatThrownBy(() -> service.create(input(List.of(), List.of(), bad, null), MANAGER))
                    .as(bad)
                    .isInstanceOf(ResponseStatusException.class);
        }
        assertThat(service.create(input(List.of(), List.of(), "/uploads/3f2b.jpg", null), MANAGER).imageUrl())
                .isEqualTo("/uploads/3f2b.jpg");
        assertThat(service.create(input(List.of(), List.of(), "https://res.cloudinary.com/x/y.jpg", null), MANAGER).imageUrl())
                .isEqualTo("https://res.cloudinary.com/x/y.jpg");
    }

    @Test
    @DisplayName("blank optional fields are stored as absent, not as empty strings")
    void blanksBecomeNull() {
        NewsInput blankish = new NewsInput(
                new NewsInput.Title("Título", "  ", ""),
                new NewsInput.Subtitle(" ", null, null),
                "  ", "", LocalDate.of(2026, 1, 1), Set.of(), List.of(), List.of());

        NewsView view = service.create(blankish, MANAGER);

        assertThat(view.title().en()).isNull();
        assertThat(view.title().fr()).isNull();
        assertThat(view.subtitle().pt()).isNull();
        assertThat(view.imageUrl()).isNull();
        assertThat(view.linkUrl()).isNull();
    }

    @Test
    @DisplayName("every write is recorded in the audit log under the acting manager")
    void writesAreAudited() {
        NewsView created = service.create(input(List.of()), MANAGER);
        News stored = new News();
        stored.setId(created.id());
        when(newsRepository.findById(created.id())).thenReturn(Optional.of(stored));

        service.update(created.id(), input(List.of()), MANAGER);
        service.delete(created.id(), MANAGER);

        verify(auditService).record(eq(MANAGER), eq("CREATE_NEWS"), eq("News"), anyString(), any());
        verify(auditService).record(eq(MANAGER), eq("UPDATE_NEWS"), eq("News"), eq(created.id().toString()), any());
        verify(auditService).record(eq(MANAGER), eq("DELETE_NEWS"), eq("News"), eq(created.id().toString()), any());
    }

    @Test
    @DisplayName("updating or deleting news that does not exist is a 404")
    void missingNewsIs404() {
        UUID missing = UUID.randomUUID();
        when(newsRepository.findById(missing)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.update(missing, input(List.of()), MANAGER))
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);
        assertThatThrownBy(() -> service.delete(missing, MANAGER))
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    @DisplayName("the public view drops a person who was removed after the news was published")
    void publicViewOmitsRemovedPeople() {
        Member ana = member("Ana Souza");
        Member later = member("Removed Later");
        News stored = new News();
        stored.setId(UUID.randomUUID());
        stored.setTitlePt("Título");
        stored.setPublishedOn(LocalDate.of(2026, 1, 1));
        stored.setMemberIds(new ArrayList<>(List.of(ana.getId(), later.getId())));
        later.setDeletedAt(Instant.now());
        when(newsRepository.findById(stored.getId())).thenReturn(Optional.of(stored));

        NewsView view = service.get(stored.getId());

        assertThat(view.people()).extracting(NewsView.Person::fullName).containsExactly("Ana Souza");
    }

    @Test
    @DisplayName("a page of news resolves everyone's names in one roster lookup, not one per item")
    @SuppressWarnings("unchecked")
    void listBatchesPeopleLookup() {
        Member ana = member("Ana Souza");
        Member bruno = member("Bruno Lima");
        News first = new News();
        first.setId(UUID.randomUUID());
        first.setTitlePt("Um");
        first.setPublishedOn(LocalDate.of(2026, 2, 1));
        first.setMemberIds(new ArrayList<>(List.of(ana.getId())));
        News second = new News();
        second.setId(UUID.randomUUID());
        second.setTitlePt("Dois");
        second.setPublishedOn(LocalDate.of(2026, 1, 1));
        second.setMemberIds(new ArrayList<>(List.of(bruno.getId(), ana.getId())));
        when(newsRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(first, second)));

        var page = service.list(Set.of(), null, 0, 20);

        assertThat(page.getContent()).hasSize(2);
        assertThat(page.getContent().get(1).people()).extracting(NewsView.Person::fullName)
                .containsExactly("Bruno Lima", "Ana Souza");
        verify(memberRepository, times(1)).findAllById(any());
    }

    @Test
    @DisplayName("out-of-range paging is a 400 rather than an unbounded query")
    void pagingIsBounded() {
        assertThatThrownBy(() -> service.list(Set.of(), null, -1, 20)).isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(() -> service.list(Set.of(), null, 0, 0)).isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(() -> service.list(Set.of(), null, 0, 101)).isInstanceOf(ResponseStatusException.class);
    }
}
