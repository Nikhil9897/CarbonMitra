package com.carbontrack.event;

import com.carbontrack.entity.Organization;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class ClubCreatedEvent extends ApplicationEvent {
    private final Organization organization;

    public ClubCreatedEvent(Object source, Organization organization) {
        super(source);
        this.organization = organization;
    }
}
