package com.carbontrack.listener;

import com.carbontrack.event.UserRegisteredEvent;
import com.carbontrack.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class UserEventListener {

    private final EmailService emailService;

    public UserEventListener(EmailService emailService) {
        this.emailService = emailService;
    }

    @Async
    @EventListener
    public void handleUserRegistered(UserRegisteredEvent event) {
        log.info("UserEventListener: received registration event for user {}", event.getUser().getUsername());
        emailService.sendWelcomeEmail(event.getUser());
    }
}
