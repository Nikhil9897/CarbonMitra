package com.carbontrack.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class PhotoUploadedEvent extends ApplicationEvent {
    private final Long userId;
    private final String base64Image;

    public PhotoUploadedEvent(Object source, Long userId, String base64Image) {
        super(source);
        this.userId = userId;
        this.base64Image = base64Image;
    }
}
