package br.uema.laps.portal;

import br.uema.laps.media.PhotoUploadService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * Photo upload for the authenticated member. Lives under /api/v1/me/** so
 * SecurityConfig's MEMBER/MANAGER rule applies — members can replace their
 * own avatar without needing the manager role.
 */
@RestController
@RequestMapping("/api/v1/me/media")
public class MyMediaController {

    private final PhotoUploadService photoUploadService;

    public MyMediaController(PhotoUploadService photoUploadService) {
        this.photoUploadService = photoUploadService;
    }

    @PostMapping(value = "/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> uploadPhoto(@RequestParam("file") MultipartFile file) throws IOException {
        return Map.of("url", photoUploadService.store(file));
    }

    @PostMapping(value = "/banner", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> uploadBanner(@RequestParam("file") MultipartFile file) throws IOException {
        return Map.of("url", photoUploadService.store(file));
    }
}
