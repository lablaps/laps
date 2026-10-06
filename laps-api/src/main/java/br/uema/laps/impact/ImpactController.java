package br.uema.laps.impact;

import br.uema.laps.security.AuthenticatedMember;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class ImpactController {
    private final ImpactService service;
    public ImpactController(ImpactService service) { this.service = service; }

    @GetMapping("/impacts")
    public Page<ImpactView> list(@RequestParam(required = false) UUID memberId,
            @RequestParam(required = false) ImpactKind kind,
            @RequestParam(required = false) LocalDate from, @RequestParam(required = false) LocalDate to,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return service.list(memberId, kind, from, to, q, page, size);
    }

    @GetMapping("/impacts/{id}")
    public ImpactView get(@PathVariable UUID id) { return service.get(id); }

    @GetMapping("/me/impacts")
    public Page<ImpactView> mine(@RequestParam(defaultValue = "0") int page,
                                @RequestParam(defaultValue = "20") int size) {
        return service.list(AuthenticatedMember.id(), null, null, null, null, page, size);
    }

    @PostMapping("/me/impacts") @ResponseStatus(HttpStatus.CREATED)
    public ImpactView create(@Valid @RequestBody ImpactInput input) { return service.save(null, input); }

    @PutMapping("/me/impacts/{id}")
    public ImpactView update(@PathVariable UUID id, @Valid @RequestBody ImpactInput input) {
        return service.save(id, input);
    }

    @DeleteMapping("/me/impacts/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) { service.delete(id); }
}
