package br.uema.laps.media;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * Admin photo upload — gated under /api/v1/admin/** by SecurityConfig.
 * Members upload through the parallel endpoint exposed by MyMediaController.
 */
@RestController
@RequestMapping("/api/v1/admin/media")
public class MediaController {

    private final PhotoUploadService photoUploadService;

    public MediaController(PhotoUploadService photoUploadService) {
        this.photoUploadService = photoUploadService;
    }

    @PostMapping(value = "/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> uploadPhoto(@RequestParam("file") MultipartFile file) throws IOException {
        return Map.of("url", photoUploadService.store(file));
    }
}
