package br.uema.laps.publication;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/publications")
public class PublicationController {

    private final PublicationRepository publicationRepository;

    public PublicationController(PublicationRepository publicationRepository) {
        this.publicationRepository = publicationRepository;
    }

    // Full filter spec: /home/user/ICARO/Icaro de Jesus/01-projects/laps/laps-publication-query-engine.md
    @GetMapping
    public Page<Publication> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Integer yearFrom,
            @RequestParam(required = false) Integer yearTo,
            @RequestParam(required = false) Set<UUID> memberId,
            @RequestParam(required = false) Set<PublicationStatus> status,
            @RequestParam(required = false) Set<PublicationType> type,
            @RequestParam(required = false) Boolean hasDoi,
            Pageable pageable
    ) {
        return publicationRepository.findAll(
                PublicationSpecifications.build(q, yearFrom, yearTo, memberId, status, type, hasDoi),
                pageable
        );
    }
}
