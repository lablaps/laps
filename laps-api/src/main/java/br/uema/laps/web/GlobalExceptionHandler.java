package br.uema.laps.web;

import br.uema.laps.roletracking.IllegalRoleTransitionException;
import br.uema.laps.security.RateLimitExceededException;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Map<String, Object>> notFound(EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body("not_found", ex.getMessage()));
    }

    @ExceptionHandler(IllegalRoleTransitionException.class)
    public ResponseEntity<Map<String, Object>> badTransition(IllegalRoleTransitionException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body("illegal_transition", ex.getMessage()));
    }

    /**
     * Bean-validation failures on @Valid request bodies.
     *
     * Without this the constraints surface as Spring's default 500-ish error,
     * which tells the member nothing about which field was rejected. The
     * message names the offending fields only — never the submitted values,
     * which could otherwise echo something the caller does not own back into
     * a log or a shared screen.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> invalidBody(MethodArgumentNotValidException ex) {
        String fields = ex.getBindingResult().getFieldErrors().stream()
                .map(f -> f.getField() + " " + f.getDefaultMessage())
                .distinct()
                .collect(Collectors.joining("; "));
        return ResponseEntity.badRequest().body(body("validation_failed", fields));
    }

    /**
     * Unique-constraint collisions, most visibly a member changing their login
     * email to one that already exists. That is a legitimate client error and
     * belongs in the 4xx range; it previously escaped as a 500.
     *
     * The driver's message is deliberately discarded — it embeds the constraint
     * name, table, and the conflicting value, which for the email case would
     * disclose that a given address is already registered.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> conflict(DataIntegrityViolationException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(body("conflict", "That value is already in use."));
    }

    /**
     * Multipart payloads over spring.servlet.multipart.max-file-size. 413 is
     * the honest answer; the default was a 500 that looked like a server bug.
     */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, Object>> tooLarge(MaxUploadSizeExceededException ex) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(body("file_too_large", "File is too large."));
    }

    /**
     * Throttled credential endpoints. Rendered here so the Retry-After header
     * can be attached to the response rather than mutated onto an exception —
     * see RateLimitExceededException for why the previous approach produced a
     * 500 instead of this 429.
     */
    @ExceptionHandler(RateLimitExceededException.class)
    public ResponseEntity<Map<String, Object>> tooManyRequests(RateLimitExceededException ex) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .header(HttpHeaders.RETRY_AFTER, String.valueOf(ex.getRetryAfterSeconds()))
                .body(body("rate_limited", "Too many attempts. Try again later."));
    }

    /**
     * Renders {@link ResponseStatusException} directly instead of letting it
     * reach the container.
     *
     * <p>Without this, Spring's default resolver calls {@code sendError}, which
     * forwards to {@code /error} as an ERROR dispatch. That forward is matched
     * by the main security chain, where {@code anyRequest().authenticated()}
     * rejects it — so every one of these exceptions arrived at the client as
     * {@code 401 unauthenticated_v3} regardless of what it actually was. A
     * password that was too short, an expired invite, an unsolved bot
     * challenge: all reported as "Full authentication is required".
     *
     * <p>It went unnoticed because the most common case, {@code 401 Invalid
     * credentials}, happens to already be a 401 — the status was right by
     * coincidence and the message was wrong.
     *
     * <p>Handling it here keeps the intended status, preserves any headers the
     * thrower attached, and stays inside the DispatcherServlet so no ERROR
     * dispatch happens at all. Reasons are developer-authored constants (or an
     * echo of the caller's own input), never another user's data.
     */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> statusException(ResponseStatusException ex) {
        String reason = ex.getReason() != null ? ex.getReason() : "Request failed";
        return ResponseEntity.status(ex.getStatusCode())
                .headers(ex.getHeaders())
                .body(body(codeFor(ex.getStatusCode()), reason));
    }

    private static String codeFor(HttpStatusCode status) {
        if (status.isSameCodeAs(HttpStatus.UNAUTHORIZED)) return "unauthenticated";
        if (status.isSameCodeAs(HttpStatus.FORBIDDEN)) return "forbidden";
        if (status.isSameCodeAs(HttpStatus.NOT_FOUND)) return "not_found";
        if (status.isSameCodeAs(HttpStatus.CONFLICT)) return "conflict";
        if (status.isSameCodeAs(HttpStatus.GONE)) return "gone";
        if (status.isSameCodeAs(HttpStatus.TOO_MANY_REQUESTS)) return "rate_limited";
        if (status.isSameCodeAs(HttpStatus.PAYLOAD_TOO_LARGE)) return "file_too_large";
        if (status.isSameCodeAs(HttpStatus.UNSUPPORTED_MEDIA_TYPE)) return "unsupported_media_type";
        return status.is4xxClientError() ? "bad_request" : "error";
    }

    private static Map<String, Object> body(String code, String message) {
        return Map.of("code", code, "message", message, "timestamp", Instant.now().toString());
    }
}
