package br.uema.laps.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;

@Service
public class LapsJwtService {

    private final String issuer;
    private final SecretKey signingKey;
    private final Duration ttl;

    public LapsJwtService(
            @Value("${laps.jwt.issuer}") String issuer,
            @Value("${laps.jwt.secret}") String secret,
            @Value("${laps.jwt.ttl}") Duration ttl
    ) {
        this.issuer = issuer;
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.ttl = ttl;
    }

    public String issue(String memberId, String email, String role) {
        Instant now = Instant.now();
        return Jwts.builder()
                .issuer(issuer)
                .subject(memberId)
                .claim("email", email)
                .claim("role", role)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(ttl)))
                .signWith(signingKey)
                .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
