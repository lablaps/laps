package br.uema.laps.news;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;
import java.util.UUID;

/**
 * Public news feed. Permitted for anonymous GETs by SecurityConfig
 * ("/api/v1/news/**").
 *
 * <p>{@code ?category=AWARD&category=SCHOLARSHIP} is how "Prêmios e Bolsas"
 * reads its list; {@code ?memberId=} is how a profile reads news about that
 * person.
 */
@RestController
@RequestMapping("/api/v1/news")
public class NewsController {

    private final NewsService service;

    public NewsController(NewsService service) {
        this.service = service;
    }

    @GetMapping
    public Page<NewsView> list(@RequestParam(name = "category", required = false) Set<NewsCategory> categories,
                               @RequestParam(required = false) UUID memberId,
                               @RequestParam(defaultValue = "0") int page,
                               @RequestParam(defaultValue = "12") int size) {
        return service.list(categories, memberId, page, size);
    }

    @GetMapping("/{id}")
    public NewsView get(@PathVariable UUID id) {
        return service.get(id);
    }
}
