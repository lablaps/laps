package br.uema.laps.graph;

import br.uema.laps.area.ResearchArea;
import br.uema.laps.area.ResearchAreaRepository;
import br.uema.laps.member.Member;
import br.uema.laps.member.MemberRepository;
import br.uema.laps.member.MemberStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Graph payload for the team neural-network visualization (/team page).
 * Spec: /home/user/ICARO/Icaro de Jesus/01-projects/laps/laps-network-revamp.md §"Graph API".
 *
 * Returns nodes (members + research areas) and edges (member→area memberships and
 * member↔member co-area connections).
 */
@RestController
@RequestMapping("/api/v1/graph")
public class GraphController {

    private final MemberRepository memberRepository;
    private final ResearchAreaRepository areaRepository;
    private final JdbcTemplate jdbc;

    public GraphController(
            MemberRepository memberRepository,
            ResearchAreaRepository areaRepository,
            JdbcTemplate jdbc
    ) {
        this.memberRepository = memberRepository;
        this.areaRepository = areaRepository;
        this.jdbc = jdbc;
    }

    @GetMapping
    public GraphPayload graph() {
        List<Member> members = memberRepository.findAll().stream()
                .filter(m -> m.getDeletedAt() == null)
                .filter(m -> m.getStatus() != MemberStatus.INACTIVE)
                .sorted(Comparator.comparing(Member::getFullName))
                .toList();

        List<ResearchArea> areas = areaRepository.findAll();

        List<Map<String, Object>> areaLinks = jdbc.queryForList(
                "SELECT member_id, area_id, is_primary FROM member_area"
        );

        List<GraphNode> nodes = new ArrayList<>(members.size() + areas.size());
        for (Member m : members) {
            nodes.add(new GraphNode(
                    "member:" + m.getId(),
                    "member",
                    m.getFullName(),
                    m.getSlug(),
                    Map.of(
                            "role",  m.getCurrentRole() != null ? m.getCurrentRole().name() : null,
                            "photo", m.getPhotoUrl()
                    )
            ));
        }
        for (ResearchArea a : areas) {
            nodes.add(new GraphNode(
                    "area:" + a.getId(),
                    "area",
                    a.getNamePt(),
                    a.getSlug(),
                    Map.of("color", a.getColor())
            ));
        }

        List<GraphEdge> edges = new ArrayList<>();
        Set<String> seenCoMember = new HashSet<>();

        for (Map<String, Object> link : areaLinks) {
            String memberId = String.valueOf(link.get("member_id"));
            Number areaIdRaw = (Number) link.get("area_id");
            boolean primary = ((Number) link.get("is_primary")).intValue() == 1;
            edges.add(new GraphEdge(
                    "member:" + memberId,
                    "area:" + areaIdRaw.intValue(),
                    primary ? "primary-area" : "area",
                    primary ? 2.0 : 1.0
            ));
        }

        // Member↔member edges where both share at least one area (deduped).
        for (int i = 0; i < areaLinks.size(); i++) {
            for (int j = i + 1; j < areaLinks.size(); j++) {
                Map<String, Object> a = areaLinks.get(i);
                Map<String, Object> b = areaLinks.get(j);
                if (!a.get("area_id").equals(b.get("area_id"))) continue;
                String left  = String.valueOf(a.get("member_id"));
                String right = String.valueOf(b.get("member_id"));
                if (left.equals(right)) continue;
                String key = left.compareTo(right) < 0 ? left + "|" + right : right + "|" + left;
                if (!seenCoMember.add(key)) continue;
                edges.add(new GraphEdge("member:" + left, "member:" + right, "co-area", 1.0));
            }
        }

        return new GraphPayload(nodes, edges);
    }

    public record GraphPayload(List<GraphNode> nodes, List<GraphEdge> edges) {}
    public record GraphNode(String id, String kind, String label, String slug, Map<String, Object> data) {}
    public record GraphEdge(String source, String target, String kind, double weight) {}
}
