package br.uema.laps.media;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Exposes the on-disk upload directory at /uploads/** so the public site can
 * fetch member photos with a plain <img src="/uploads/{file}"> tag — no auth
 * required for read, just like any other static asset.
 */
@Configuration
public class MediaConfig implements WebMvcConfigurer {

    private final String uploadDir;
    private final String publicBaseUrl;

    public MediaConfig(
            @Value("${laps.media.upload-dir}") String uploadDir,
            @Value("${laps.media.public-base-url}") String publicBaseUrl
    ) {
        this.uploadDir = uploadDir;
        this.publicBaseUrl = publicBaseUrl;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path absolute = Paths.get(uploadDir).toAbsolutePath().normalize();
        registry.addResourceHandler(publicBaseUrl + "/**")
                .addResourceLocations("file:" + absolute.toString() + "/")
                .setCachePeriod(3600);
    }
}
