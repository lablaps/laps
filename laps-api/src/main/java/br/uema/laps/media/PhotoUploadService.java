package br.uema.laps.media;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

/**
 * Shared upload logic so the admin and member-portal endpoints don't have to
 * duplicate the validation + write-to-disk dance. Lives in a service rather
 * than as a static utility because the upload-dir config has to be injected.
 */
@Service
public class PhotoUploadService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            MediaType.IMAGE_JPEG_VALUE,
            MediaType.IMAGE_PNG_VALUE,
            "image/webp"
    );

    private final Path uploadRoot;
    private final String publicBaseUrl;
    private final long maxBytes;

    public PhotoUploadService(
            @Value("${laps.media.upload-dir}") String uploadDir,
            @Value("${laps.media.public-base-url}") String publicBaseUrl,
            @Value("${laps.media.max-bytes}") long maxBytes
    ) {
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.publicBaseUrl = publicBaseUrl;
        this.maxBytes = maxBytes;
    }

    @PostConstruct
    void ensureDir() throws IOException {
        Files.createDirectories(uploadRoot);
    }

    public String store(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "file is required");
        }
        if (file.getSize() > maxBytes) {
            throw new ResponseStatusException(
                    HttpStatus.PAYLOAD_TOO_LARGE,
                    "file exceeds " + (maxBytes / 1024) + " KiB"
            );
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new ResponseStatusException(
                    HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                    "only JPEG, PNG, or WebP are accepted"
            );
        }

        String ext = switch (contentType) {
            case MediaType.IMAGE_JPEG_VALUE -> ".jpg";
            case MediaType.IMAGE_PNG_VALUE -> ".png";
            case "image/webp" -> ".webp";
            default -> "";
        };
        String filename = UUID.randomUUID() + ext;

        // Resolve-then-normalize defeats "../" smuggling even though the UUID
        // we generate doesn't contain separators — defense in depth.
        Path target = uploadRoot.resolve(filename).normalize();
        if (!target.startsWith(uploadRoot)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid filename");
        }

        try (var in = file.getInputStream()) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        }

        return publicBaseUrl + "/" + filename;
    }
}
