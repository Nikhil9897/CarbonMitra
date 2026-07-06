package com.carbontrack.service.impl;

import com.carbontrack.service.TokenBlacklistService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class TokenBlacklistServiceImpl implements TokenBlacklistService {

    private final StringRedisTemplate redisTemplate;
    private static final String BLACKLIST_PREFIX = "jwt:blacklist:";

    public TokenBlacklistServiceImpl(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public void blacklistToken(String token, long expirationMs) {
        if (token != null && expirationMs > 0) {
            try {
                redisTemplate.opsForValue().set(
                        BLACKLIST_PREFIX + token,
                        "true",
                        expirationMs,
                        TimeUnit.MILLISECONDS
                );
            } catch (Exception e) {
                log.error("Failed to blacklist token in Redis: {}", e.getMessage());
            }
        }
    }

    @Override
    public boolean isTokenBlacklisted(String token) {
        if (token == null) {
            return false;
        }
        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey(BLACKLIST_PREFIX + token));
        } catch (Exception e) {
            log.warn("Redis connection failed while checking token blacklist. Falling back to allowed. Error: {}", e.getMessage());
            return false;
        }
    }
}
