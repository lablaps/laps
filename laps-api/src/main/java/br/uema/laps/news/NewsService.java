package br.uema.laps.news;

import br.uema.laps.audit.AuditService;
import br.uema.laps.member.Member;
import br.uema.laps.member.MemberRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Reads for everyone, writes for managers (the /api/v1/admin/** rule in
 * SecurityConfig is what makes them manager-only; this class trusts its
 * caller on that and records who acted).
 *
 * <p>Everything accepted here is rendered on the public site, so the checks
 * that need more than annotations live here: people must be current members,
 * the outbound link must be a web link, and the image must be one the lab
 * uploaded or an https URL.
 */
@Service
public class NewsService {

    private static final int MAX_PAGE_SIZE = 100;

    private final NewsRepository newsRepository;
    private final MemberRepository memberRepository;
    private final AuditService auditService;

    public NewsService(NewsRepository newsRepository, MemberRepository memberRepository,
                       AuditService auditService) {
        this.newsRepository = newsRepository;
        this.memberRepository = memberRepository;
        this.auditService = auditService;
    }

    // ───── Reads ─────

    /**
     * Newest first. {@code categories} matches any of them ("prizes OR
     * scholarships"); {@code memberId} narrows to cards naming that person.
     */
    @Transactional(readOnly = true)
    public Page<NewsView> list(Set<NewsCategory> categories, UUID memberId, int page, int size) {
        if (page < 0 || size < 1 || size > MAX_PAGE_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid paging");
        }
        Set<NewsCategory> wanted = categories == null ? Set.of() : categories;

        Specification<News> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (!wanted.isEmpty()) {
                // A card in two wanted categories would otherwise appear twice.
                query.distinct(true);
                Join<News, NewsCategory> category = root.join("categories");
                predicates.add(category.in(wanted));
            }
            if (memberId != null) {
                Join<News, UUID> person = root.join("memberIds");
                predicates.add(cb.equal(person, memberId));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };

        Page<News> found = newsRepository.findAll(spec,
                PageRequest.of(page, size, Sort.by(Sort.Order.desc("publishedOn"), Sort.Order.desc("id"))));

        // One roster query for every person on the page.
        Map<UUID, Member> people = activeMembers(found.getContent().stream()
                .flatMap(n -> n.getMemberIds().stream())
                .collect(Collectors.toSet()));
        return new PageImpl<>(found.getContent().stream().map(n -> toView(n, people)).toList(),
                found.getPageable(), found.getTotalElements());
    }

    @Transactional(readOnly = true)
    public NewsView get(UUID id) {
        News news = newsRepository.findById(id).orElseThrow(NewsService::notFound);
        return toView(news, activeMembers(news.getMemberIds()));
    }

    // ───── Writes (manager-only, see class doc) ─────

    @Transactional
    public NewsView create(NewsInput input, UUID actorId) {
        News news = new News();
        news.setId(UUID.randomUUID());
        news.setCreatedAt(Instant.now());
        Map<UUID, Member> people = apply(news, input);
        News saved = newsRepository.save(news);
        auditService.record(actorId, "CREATE_NEWS", "News", saved.getId().toString(), input);
        return toView(saved, people);
    }

    @Transactional
    public NewsView update(UUID id, NewsInput input, UUID actorId) {
        News news = newsRepository.findById(id).orElseThrow(NewsService::notFound);
        Map<UUID, Member> people = apply(news, input);
        News saved = newsRepository.save(news);
        auditService.record(actorId, "UPDATE_NEWS", "News", id.toString(), input);
        return toView(saved, people);
    }

    @Transactional
    public void delete(UUID id, UUID actorId) {
        News news = newsRepository.findById(id).orElseThrow(NewsService::notFound);
        newsRepository.delete(news);
        auditService.record(actorId, "DELETE_NEWS", "News", id.toString(), null);
    }

    /** Validates {@code input} and copies it onto {@code news}; returns the people it names. */
    private Map<UUID, Member> apply(News news, NewsInput input) {
        List<UUID> memberIds = new ArrayList<>(new LinkedHashSet<>(input.memberIds()));
        Map<UUID, Member> people = activeMembers(memberIds);
        if (people.size() != memberIds.size()) {
            // Checked here rather than left to the foreign key: a FK failure
            // surfaces as a 500, and a soft-deleted member would pass the FK.
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown or removed member");
        }

        NewsInput.Title title = input.title();
        NewsInput.Subtitle subtitle = input.subtitle();
        news.setTitlePt(title.pt().trim());
        news.setTitleEn(blankToNull(title.en()));
        news.setTitleFr(blankToNull(title.fr()));
        news.setSubtitlePt(subtitle == null ? null : blankToNull(subtitle.pt()));
        news.setSubtitleEn(subtitle == null ? null : blankToNull(subtitle.en()));
        news.setSubtitleFr(subtitle == null ? null : blankToNull(subtitle.fr()));
        news.setImageUrl(validImageUrl(blankToNull(input.imageUrl())));
        news.setLinkUrl(validLinkUrl(blankToNull(input.linkUrl())));
        news.setPublishedOn(input.publishedOn());
        news.setTags(normaliseTags(input.tags()));
        news.setCategories(input.categories().isEmpty()
                ? EnumSet.noneOf(NewsCategory.class) : EnumSet.copyOf(input.categories()));
        // A fresh list, not clear()+addAll(): Hibernate rewrites a replaced
        // indexed collection as delete-then-insert instead of in-place updates.
        news.setMemberIds(memberIds);
        news.setUpdatedAt(Instant.now());
        return people;
    }

    // ───── Helpers ─────

    /** Members by id, skipping anyone soft-deleted — they no longer exist publicly. */
    private Map<UUID, Member> activeMembers(Collection<UUID> ids) {
        if (ids.isEmpty()) return Map.of();
        return memberRepository.findAllById(Set.copyOf(ids)).stream()
                .filter(m -> m.getDeletedAt() == null)
                .collect(Collectors.toMap(Member::getId, Function.identity(), (a, b) -> a));
    }

    private static NewsView toView(News n, Map<UUID, Member> people) {
        List<NewsView.Person> named = n.getMemberIds().stream()
                .map(people::get)
                .filter(Objects::nonNull)
                .map(NewsView.Person::of)
                .toList();
        List<NewsCategory> categories = n.getCategories().stream().sorted().toList();
        return new NewsView(
                n.getId(),
                new NewsView.Text(n.getTitlePt(), n.getTitleEn(), n.getTitleFr()),
                new NewsView.Text(n.getSubtitlePt(), n.getSubtitleEn(), n.getSubtitleFr()),
                n.getImageUrl(),
                n.getLinkUrl(),
                n.getPublishedOn(),
                categories,
                List.copyOf(n.getTags()),
                named,
                n.getCreatedAt(),
                n.getUpdatedAt());
    }

    /**
     * Trimmed, inner whitespace collapsed, case-insensitively deduplicated with
     * the first spelling kept — "EEG" and "eeg" are one tag on a card.
     */
    static List<String> normaliseTags(List<String> raw) {
        Map<String, String> byKey = new LinkedHashMap<>();
        for (String tag : raw) {
            String clean = tag == null ? "" : tag.trim().replaceAll("\\s+", " ");
            if (!clean.isEmpty()) byKey.putIfAbsent(clean.toLowerCase(Locale.ROOT), clean);
        }
        return new ArrayList<>(byKey.values());
    }

    /**
     * The outbound link must be a web link. The SPA renders it as an href on a
     * public page, so javascript: or data: would be stored XSS, and a URL with
     * credentials in it is a phishing shape.
     */
    static String validLinkUrl(String url) {
        if (url == null) return null;
        URI uri = parse(url);
        String scheme = uri.getScheme();
        if (scheme == null || !(scheme.equalsIgnoreCase("https") || scheme.equalsIgnoreCase("http"))
                || uri.getHost() == null || uri.getRawUserInfo() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Link must be an http(s) URL");
        }
        return url;
    }

    /**
     * Images come from PhotoUploadService, which returns either a local
     * {@code /uploads/<file>} path or an https Cloudinary URL — so those are the
     * two shapes accepted. Plain http is refused because the page is served
     * over https and the browser would block it as mixed content; a path with
     * ".." or outside /uploads/ is refused because the SPA prefixes it with the
     * API origin and it must not reach anything else the server serves.
     */
    static String validImageUrl(String url) {
        if (url == null) return null;
        if (url.startsWith("/uploads/")) {
            if (url.contains("..") || url.contains("\\") || url.indexOf("//", 1) >= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid image path");
            }
            return url;
        }
        URI uri = parse(url);
        if (!"https".equalsIgnoreCase(uri.getScheme()) || uri.getHost() == null || uri.getRawUserInfo() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image must be an upload or an https URL");
        }
        return url;
    }

    private static URI parse(String url) {
        try {
            return new URI(url);
        } catch (URISyntaxException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Malformed URL");
        }
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    private static ResponseStatusException notFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "News not found");
    }
}
