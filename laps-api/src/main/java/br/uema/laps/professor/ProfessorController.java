package br.uema.laps.professor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/professor")
public class ProfessorController {

    private final ProfessorRepository repository;

    public ProfessorController(ProfessorRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<Professor> get() {
        return repository.findAll().stream().findFirst()
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
