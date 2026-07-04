package com.carbontrack.listener;

import com.carbontrack.event.ActivityLoggedEvent;
import com.carbontrack.service.GoalService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class GoalProgressListener {

    private final GoalService goalService;

    public GoalProgressListener(GoalService goalService) {
        this.goalService = goalService;
    }

    @EventListener
    public void handleActivityLogged(ActivityLoggedEvent event) {
        log.info("GoalProgressListener: checking goal status and progress updates");
        goalService.checkAndUpdateGoalsProgress();
    }
}
