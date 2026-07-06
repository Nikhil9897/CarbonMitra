package com.carbontrack.listener;

import com.carbontrack.event.ClubCreatedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class ClubCreatedListener {

    @Async("notificationExecutor")
    @EventListener
    public void handleClubCreated(ClubCreatedEvent event) {
        log.info("Async Club Created Event: Sustainability club '{}' successfully registered.",
                event.getOrganization().getName());
    }
}
