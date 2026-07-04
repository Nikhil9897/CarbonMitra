package com.carbontrack.mapper;

import com.carbontrack.dto.ActivityLogResponse;
import com.carbontrack.entity.ActivityLog;

public class ActivityLogMapper {
    public static ActivityLogResponse toResponse(ActivityLog log) {
        if (log == null) {
            return null;
        }
        return ActivityLogResponse.builder()
                .id(log.getId())
                .userId(log.getUser() != null ? log.getUser().getId() : null)
                .category(log.getCategory().name())
                .activityType(log.getActivityType())
                .quantity(log.getQuantity())
                .unit(log.getUnit())
                .co2e(log.getCo2e())
                .logDate(log.getLogDate())
                .build();
    }
}
