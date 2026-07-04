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
public class GoalProgressResponse {
    private Long goalId;
    private Double targetReduction;
    private Integer periodDays;
    private LocalDate startDate;
    private String status;
    private Double baselineEmissions;
    private Double actualEmissions;
    private Double carbonSaved;
    private Double percentComplete;
    private Long daysRemaining;
}
