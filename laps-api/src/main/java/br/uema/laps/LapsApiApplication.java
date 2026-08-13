package br.uema.laps;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

// @EnableScheduling powers AuthRateLimiter#sweep — without it the @Scheduled
// annotation is silently inert and the limiter's maps grow without bound.
@SpringBootApplication
@EnableScheduling
public class LapsApiApplication {
    public static void main(String[] args) {
        SpringApplication.run(LapsApiApplication.class, args);
    }
}
