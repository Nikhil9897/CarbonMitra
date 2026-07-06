package com.carbontrack.listener;

import com.carbontrack.event.EventCreatedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class EventCreatedListener {

    @Async("notificationExecutor")
    @EventListener
    public void handleEventCreated(EventCreatedEvent event) {
        log.info("Async Event Created: Carbon tracking challenge initialized for Goal ID {}. Target Reduction: {} kg CO2e over {} days",
                event.getGoal().getId(), event.getGoal().getTargetReduction(), event.getGoal().getPeriodDays());
    }
}
