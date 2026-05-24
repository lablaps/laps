package br.uema.laps.web;

import br.uema.laps.roletracking.IllegalRoleTransitionException;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.Map;

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

    private static Map<String, Object> body(String code, String message) {
        return Map.of("code", code, "message", message, "timestamp", Instant.now().toString());
    }
}
