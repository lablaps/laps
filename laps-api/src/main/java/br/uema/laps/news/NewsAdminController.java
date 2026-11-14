package br.uema.laps.news;

import br.uema.laps.security.AuthenticatedMember;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * Publishing news from the Central de Comando. Manager-only because it sits
 * under /api/v1/admin/**, which SecurityConfig restricts to the MANAGER
 * authority — the same gate as every other console write.
 *
 * <p>Its own controller rather than more methods on AdminController, which is
 * already the largest class in the module. Images go through the existing
 * POST /api/v1/admin/media/photo and arrive here as a URL.
 */
@RestController
@RequestMapping("/api/v1/admin/news")
public class NewsAdminController {

    private final NewsService service;

    public NewsAdminController(NewsService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NewsView create(@Valid @RequestBody NewsInput input) {
        return service.create(input, AuthenticatedMember.id());
    }

    @PutMapping("/{id}")
    public NewsView update(@PathVariable UUID id, @Valid @RequestBody NewsInput input) {
        return service.update(id, input, AuthenticatedMember.id());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id, AuthenticatedMember.id());
    }
}
