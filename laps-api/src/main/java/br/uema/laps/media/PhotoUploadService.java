package br.uema.laps.media;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
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
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Shared upload logic for admin and member-portal photo/banner endpoints.
 *
 * Provider selection (checked once at startup):
 *   - Cloudinary: when CLOUDINARY_CLOUD_NAME + _API_KEY + _API_SECRET are all set.
 *     Files are uploaded to Cloudinary and a permanent https://res.cloudinary.com/...
 *     URL is returned. Images survive backend restarts and are served from Cloudinary's CDN.
 *   - Local disk (fallback): files written to laps.media.upload-dir and served at /uploads/*.
 *     Suitable for local dev; will go blank on Render free-tier disk resets.
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

    private final String cloudName;
    private final String apiKey;
    private final String apiSecret;
    private final String folder;

    private Cloudinary cloudinary;

    public PhotoUploadService(
            @Value("${laps.media.upload-dir}") String uploadDir,
            @Value("${laps.media.public-base-url}") String publicBaseUrl,
            @Value("${laps.media.max-bytes}") long maxBytes,
            @Value("${laps.media.cloudinary-cloud-name:}") String cloudName,
            @Value("${laps.media.cloudinary-api-key:}") String apiKey,
            @Value("${laps.media.cloudinary-api-secret:}") String apiSecret,
            @Value("${laps.media.cloudinary-folder:laps}") String folder) {
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.publicBaseUrl = publicBaseUrl;
        this.maxBytes = maxBytes;
        this.cloudName = cloudName;
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.folder = folder;
    }

    @PostConstruct
    void init() throws IOException {
        if (isCloudinaryEnabled()) {
            this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret,
                    "secure", true
            ));
        } else {
            Files.createDirectories(uploadRoot);
        }
    }

    private boolean isCloudinaryEnabled() {
        return cloudName != null && !cloudName.isBlank()
                && apiKey != null && !apiKey.isBlank()
                && apiSecret != null && !apiSecret.isBlank();
    }

    /**
     * Validate and store the file. Returns a URL:
     * - Cloudinary mode → full https://res.cloudinary.com/... (stored in DB as-is)
     * - Local mode      → relative /uploads/uuid.ext (resolved at display time via resolveMediaUrl)
     */
    @SuppressWarnings("unchecked")
    public String store(MultipartFile file) throws IOException {
        validate(file);

        if (isCloudinaryEnabled()) {
            Map<String, Object> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", folder,
                            "resource_type", "image",
                            "use_filename", false,
                            "unique_filename", true
                    )
            );
            return (String) result.get("secure_url");
        }

        return storeLocally(file);
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "file is required");
        }
        if (file.getSize() > maxBytes) {
            throw new ResponseStatusException(
                    HttpStatus.PAYLOAD_TOO_LARGE,
                    "file exceeds " + (maxBytes / 1024) + " KiB");
        }
        String ct = file.getContentType();
        if (ct == null || !ALLOWED_CONTENT_TYPES.contains(ct)) {
            throw new ResponseStatusException(
                    HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                    "only JPEG, PNG, or WebP are accepted");
        }
    }

    private String storeLocally(MultipartFile file) throws IOException {
        String ext = switch (file.getContentType()) {
            case MediaType.IMAGE_JPEG_VALUE -> ".jpg";
            case MediaType.IMAGE_PNG_VALUE  -> ".png";
            case "image/webp"              -> ".webp";
            default                        -> "";
        };
        String filename = UUID.randomUUID() + ext;
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
