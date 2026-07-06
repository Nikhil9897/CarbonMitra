package com.carbontrack.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class CarbonCalculatedEvent extends ApplicationEvent {
    private final Long userId;
    private final String activityType;
    private final Double co2e;

    public CarbonCalculatedEvent(Object source, Long userId, String activityType, Double co2e) {
        super(source);
        this.userId = userId;
        this.activityType = activityType;
        this.co2e = co2e;
    }
}
