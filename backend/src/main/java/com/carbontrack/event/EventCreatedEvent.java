package com.carbontrack.event;

import com.carbontrack.entity.Goal;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class EventCreatedEvent extends ApplicationEvent {
    private final Goal goal;

    public EventCreatedEvent(Object source, Goal goal) {
        super(source);
        this.goal = goal;
    }
}
