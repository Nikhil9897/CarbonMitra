package com.carbontrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalPredictionResponse {
    private Long goalId;
    private Double targetReduction;
    private Long daysRemaining;
    private Double dailySavingRateNeeded;
    private Double currentDailySavingRate;
    private boolean onTrack;
    private String predictedStatus;
    private LocalDate estimatedCompletionDate;
}
