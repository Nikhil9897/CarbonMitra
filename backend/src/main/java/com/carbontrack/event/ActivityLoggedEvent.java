package com.carbontrack.event;

import com.carbontrack.entity.ActivityLog;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class ActivityLoggedEvent extends ApplicationEvent {
    private final ActivityLog activityLog;

    public ActivityLoggedEvent(Object source, ActivityLog activityLog) {
        super(source);
        this.activityLog = activityLog;
    }
}
