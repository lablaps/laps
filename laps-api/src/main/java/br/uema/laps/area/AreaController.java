package br.uema.laps.area;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/areas")
public class AreaController {

    private final ResearchAreaRepository repository;

    public AreaController(ResearchAreaRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<ResearchArea> list() {
        return repository.findAll();
    }
}
