package com.carbontrack.mapper;

import com.carbontrack.dto.GoalResponse;
import com.carbontrack.entity.Goal;

public class GoalMapper {
    public static GoalResponse toResponse(Goal goal) {
        if (goal == null) {
            return null;
        }
        return GoalResponse.builder()
                .id(goal.getId())
                .userId(goal.getUser() != null ? goal.getUser().getId() : null)
                .targetReduction(goal.getTargetReduction())
                .periodDays(goal.getPeriodDays())
                .startDate(goal.getStartDate())
                .status(goal.getStatus().name())
                .build();
    }
}
