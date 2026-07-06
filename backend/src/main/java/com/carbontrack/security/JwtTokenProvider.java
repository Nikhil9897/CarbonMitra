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
        return generateTokenFromPrincipal(userPrincipal, jwtExpirationInMs);
    }

    public String generateRefreshToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        return generateTokenFromPrincipal(userPrincipal, jwtRefreshExpirationInMs);
    }

    public String generateAccessToken(UserPrincipal userPrincipal) {
        return generateTokenFromPrincipal(userPrincipal, jwtExpirationInMs);
    }

    public String generateRefreshToken(UserPrincipal userPrincipal) {
        return generateTokenFromPrincipal(userPrincipal, jwtRefreshExpirationInMs);
    }

    public String generateTokenFromPrincipal(UserPrincipal userPrincipal, long expirationMs) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        Claims claims = Jwts.claims()
                .subject(userPrincipal.getUsername())
                .add("id", userPrincipal.getId())
                .add("email", userPrincipal.getEmail())
                .add("role", userPrincipal.getAuthorities().stream()
                        .map(org.springframework.security.core.GrantedAuthority::getAuthority)
                        .findFirst().orElse("ROLE_USER"))
                .add("orgId", userPrincipal.getOrganizationId())
                .build();

        return Jwts.builder()
                .claims(claims)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(jwtSecretKey)
                .compact();
    }

    public UserPrincipal getUserPrincipalFromJWT(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(jwtSecretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        Long id = null;
        Object idVal = claims.get("id");
        if (idVal != null) {
            id = ((Number) idVal).longValue();
        }

        String email = claims.get("email", String.class);
        String username = claims.getSubject();
        String role = claims.get("role", String.class);

        Long orgId = null;
        Object orgIdVal = claims.get("orgId");
        if (orgIdVal != null) {
            orgId = ((Number) orgIdVal).longValue();
        }

        java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> authorities = role != null ?
                java.util.Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority(role)) :
                java.util.Collections.emptyList();

        return new UserPrincipal(id, email, username, "", orgId, authorities);
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
