package com.carbontrack.listener;

import com.carbontrack.event.CarbonCalculatedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class CarbonCalculatedListener {

    @Async("analyticsExecutor")
    @EventListener
    public void handleCarbonCalculated(CarbonCalculatedEvent event) {
        log.info("Async Carbon Calculation Event: User ID {} calculated {} kg CO2e for activity '{}'",
                event.getUserId(), event.getCo2e(), event.getActivityType());
    }
}
