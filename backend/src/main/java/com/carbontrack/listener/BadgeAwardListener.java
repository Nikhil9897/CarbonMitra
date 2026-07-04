package com.carbontrack.listener;

import com.carbontrack.event.ActivityLoggedEvent;
import com.carbontrack.service.BadgeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class BadgeAwardListener {

    private final BadgeService badgeService;

    public BadgeAwardListener(BadgeService badgeService) {
        this.badgeService = badgeService;
    }

    @EventListener
    public void handleActivityLogged(ActivityLoggedEvent event) {
        log.info("BadgeAwardListener: checking badge awards for user {}", event.getActivityLog().getUser().getUsername());
        badgeService.checkForAndAwardBadges(event.getActivityLog().getUser());
    }
}
