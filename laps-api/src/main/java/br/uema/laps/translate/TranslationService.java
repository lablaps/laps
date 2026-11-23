package br.uema.laps.translate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Translation client used to auto-fill EN/FR bios from a PT source.
 *
 * Default provider is **MyMemory** (https://mymemory.translated.net/doc/spec.php).
 * It's a free GET endpoint with no API key required for low-volume use
 * (~5000 chars/day per IP, more with an email). Picked over LibreTranslate
 * because the public libretranslate.de mirror was retired in 2024 and now
 * returns a 301 Cloudflare error page — that's what was silently breaking the
 * PT → EN/FR pipeline.
 *
 * If {@code laps.translate.provider} is set to {@code libretranslate} the
 * service uses {@code laps.translate.base-url} as a LibreTranslate-compatible
 * POST endpoint instead (self-hosted instances stay supported).
 *
 * Failure modes are non-fatal: any error → log WARN, return the source string
 * unchanged. Member save proceeds either way.
 */
@Service
public class TranslationService {

    private static final Logger log = LoggerFactory.getLogger(TranslationService.class);
    private static final String MYMEMORY_BASE = "https://api.mymemory.translated.net/get";

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();
    private final ObjectMapper mapper = new ObjectMapper();

    private final String provider;
    private final String baseUrl;
    private final String apiKey;

    public TranslationService(
            @Value("${laps.translate.provider:mymemory}") String provider,
            @Value("${laps.translate.base-url:}") String baseUrl,
            @Value("${laps.translate.api-key:}") String apiKey
    ) {
        this.provider = provider == null ? "mymemory" : provider.trim().toLowerCase();
        this.baseUrl = baseUrl == null ? "" : baseUrl.replaceAll("/+$", "");
        this.apiKey = apiKey == null ? "" : apiKey;
    }

    /**
     * Translate {@code text} from PT to the target language (ISO 639-1 code).
     * Returns the original text unchanged on any failure or when targetLang == pt.
     */
    public String translate(String text, String targetLang) {
        if (text == null || text.isBlank()) return text;
        if ("pt".equalsIgnoreCase(targetLang)) return text;

        try {
            return switch (provider) {
                case "libretranslate" -> translateViaLibreTranslate(text, targetLang);
                default -> translateViaMyMemory(text, targetLang);
            };
        } catch (Exception ex) {
            log.warn("Translation to {} failed; keeping source. cause={}", targetLang, redactKey(ex.toString()));
            return text;
        }
    }

    /**
     * Strips {@code laps.translate.api-key} out of anything we log.
     *
     * The key is a query parameter on the MyMemory request URL, and the
     * exceptions that reach the catch above (URI parsing, connect/timeout
     * failures) embed the full URL in their own message — so logging the cause
     * verbatim published the key. Provider response bodies get the same
     * treatment: they are third-party text that can echo the request back.
     * No-op when no key is configured, which is the default.
     */
    private String redactKey(String message) {
        if (apiKey.isBlank() || message == null) return message;
        return message.replace(apiKey, "***");
    }

    private String translateViaMyMemory(String text, String targetLang) throws Exception {
        String q = URLEncoder.encode(text, StandardCharsets.UTF_8);
        String pair = URLEncoder.encode("pt|" + targetLang, StandardCharsets.UTF_8);
        String url = MYMEMORY_BASE + "?q=" + q + "&langpair=" + pair;
        if (!apiKey.isBlank()) {
            url += "&key=" + URLEncoder.encode(apiKey, StandardCharsets.UTF_8);
        }

        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(10))
                .header("Accept", "application/json")
                .GET()
                .build();
        HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        if (res.statusCode() / 100 != 2) {
            log.warn("MyMemory returned {} for target={}: {}", res.statusCode(), targetLang, redactKey(res.body()));
            return text;
        }
        JsonNode node = mapper.readTree(res.body());
        JsonNode translated = node.path("responseData").path("translatedText");
        if (translated.isMissingNode() || translated.isNull()) {
            log.warn("MyMemory response missing responseData.translatedText for target={}", targetLang);
            return text;
        }
        String out = translated.asText().trim();
        if (out.isBlank()) return text;
        log.debug("MyMemory pt→{} ok ({} chars)", targetLang, out.length());
        return out;
    }

    private String translateViaLibreTranslate(String text, String targetLang) throws Exception {
        if (baseUrl.isBlank()) {
            log.warn("provider=libretranslate but laps.translate.base-url is empty");
            return text;
        }
        Map<String, Object> payload = new HashMap<>();
        payload.put("q", text);
        payload.put("source", "pt");
        payload.put("target", targetLang);
        payload.put("format", "text");
        if (!apiKey.isBlank()) payload.put("api_key", apiKey);

        String body = mapper.writeValueAsString(payload);
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/translate"))
                .timeout(Duration.ofSeconds(10))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                .build();
        HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        if (res.statusCode() / 100 != 2) {
            log.warn("LibreTranslate returned {} for target={}: {}", res.statusCode(), targetLang, redactKey(res.body()));
            return text;
        }
        JsonNode node = mapper.readTree(res.body());
        JsonNode translated = node.get("translatedText");
        if (translated == null || translated.isNull()) {
            log.warn("LibreTranslate response missing translatedText for target={}", targetLang);
            return text;
        }
        return translated.asText();
    }
}
