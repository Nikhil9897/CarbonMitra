package com.carbontrack.service;

public interface TokenBlacklistService {
    void blacklistToken(String token, long expirationMs);
    boolean isTokenBlacklisted(String token);
}
