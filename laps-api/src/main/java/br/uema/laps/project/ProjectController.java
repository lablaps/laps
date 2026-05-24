package br.uema.laps.project;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/projects")
public class ProjectController {

    private final ProjectRepository projectRepository;

    public ProjectController(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    @GetMapping
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    /**
     * Look up a single project by slug or id — used by the public /projects detail
     * dialog so it can deep-link to a stable URL without re-fetching the whole list.
     */
    @GetMapping("/{slugOrId}")
    public Project getOne(@PathVariable String slugOrId) {
        var bySlug = projectRepository.findBySlug(slugOrId);
        if (bySlug.isPresent()) return bySlug.get();
        try {
            return projectRepository.findById(UUID.fromString(slugOrId))
                    .orElseThrow(() -> new EntityNotFoundException("project not found: " + slugOrId));
        } catch (IllegalArgumentException ex) {
            throw new EntityNotFoundException("project not found: " + slugOrId);
        }
    }
}
