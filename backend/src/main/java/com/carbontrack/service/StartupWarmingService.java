package com.carbontrack.service;

import com.carbontrack.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class StartupWarmingService {

    private final UserRepository userRepository;

    public StartupWarmingService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Async("databaseExecutor")
    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        log.info("ApplicationReadyEvent received. Warm-up task triggered...");
        try {
            // Warm up database connection pool by running a simple query
            long userCount = userRepository.count();
            log.info("Database connection pool warmed up successfully. Current users: {}", userCount);
        } catch (Exception e) {
            log.error("Failed to pre-warm database connection: {}", e.getMessage(), e);
        }
    }
}
