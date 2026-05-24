package br.uema.laps.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Serves uploaded files (photos, banners) from the local filesystem at /uploads/*.
 * Without this handler, Spring Boot would accept the file write from PhotoUploadService
 * but have no way to serve the bytes back — every /uploads/** request would 404.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${laps.media.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path root = Paths.get(uploadDir).toAbsolutePath().normalize();
        registry
            .addResourceHandler("/uploads/**")
            .addResourceLocations("file:" + root + "/")
            .setCachePeriod(3600);
    }
}
