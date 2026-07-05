package com.carbontrack.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
@Slf4j
public class JwtTokenProvider {

    private final SecretKey jwtSecretKey;
    private final long jwtExpirationInMs;
    private final long jwtRefreshExpirationInMs;

    public JwtTokenProvider(
            @Value("${app.jwt.secret}") String jwtSecret,
            @Value("${app.jwt.expiration-ms}") long jwtExpirationInMs,
            @Value("${app.jwt.refresh-expiration-ms}") long jwtRefreshExpirationInMs) {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        this.jwtSecretKey = Keys.hmacShaKeyFor(keyBytes);
        this.jwtExpirationInMs = jwtExpirationInMs;
        this.jwtRefreshExpirationInMs = jwtRefreshExpirationInMs;
    }

    public String generateAccessToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        return generateAccessTokenFromUsername(userPrincipal.getUsername());
    }

    public String generateRefreshToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        return generateRefreshTokenFromUsername(userPrincipal.getUsername());
    }

    public String generateAccessTokenFromUsername(String username) {
        return generateTokenFromUsername(username, jwtExpirationInMs);
    }

    public String generateRefreshTokenFromUsername(String username) {
        return generateTokenFromUsername(username, jwtRefreshExpirationInMs);
    }

    public String generateTokenFromUsername(String username, long expirationMs) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(username)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(jwtSecretKey)
                .compact();
    }

    public String getUsernameFromJWT(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(jwtSecretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    public long getRemainingExpirationMs(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(jwtSecretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            Date expiration = claims.getExpiration();
            Date now = new Date();
            return Math.max(0, expiration.getTime() - now.getTime());
        } catch (Exception e) {
            return 0;
        }
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parser().verifyWith(jwtSecretKey).build().parseSignedClaims(authToken);
            return true;
        } catch (ExpiredJwtException ex) {
            log.warn("JWT token expired: {}", ex.getMessage());
        } catch (JwtException | IllegalArgumentException ex) {
            log.warn("Invalid JWT token: {}", ex.getMessage());
        }
        return false;
    }
}
