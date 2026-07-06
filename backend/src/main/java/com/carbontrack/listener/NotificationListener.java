package com.carbontrack.listener;

import com.carbontrack.event.ActivityLoggedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class NotificationListener {

    @Async("notificationExecutor")
    @EventListener
    public void handleActivityLogged(ActivityLoggedEvent event) {
        log.info("NOTIFICATION: User '{}' logged '{}' activity for '{}' (Qty: {} {}), calculating emission of {} kg CO2e",
                event.getActivityLog().getUser().getUsername(),
                event.getActivityLog().getCategory(),
                event.getActivityLog().getActivityType(),
                event.getActivityLog().getQuantity(),
                event.getActivityLog().getUnit(),
                event.getActivityLog().getCo2e());
    }
}
