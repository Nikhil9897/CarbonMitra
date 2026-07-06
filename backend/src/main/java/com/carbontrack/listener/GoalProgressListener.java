package com.carbontrack.listener;

import com.carbontrack.event.ActivityLoggedEvent;
import com.carbontrack.service.GoalService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class GoalProgressListener {

    private final GoalService goalService;

    public GoalProgressListener(GoalService goalService) {
        this.goalService = goalService;
    }

    @Async("databaseExecutor")
    @EventListener
    public void handleActivityLogged(ActivityLoggedEvent event) {
        Long userId = event.getActivityLog().getUser().getId();
        log.info("GoalProgressListener: checking goal status and progress updates for user ID {}", userId);
        goalService.checkAndUpdateGoalsProgress(userId);
    }
}
