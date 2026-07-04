package com.carbontrack.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;

@Data
public class GoalRequest {
    @NotNull(message = "Target reduction in kg is required")
    @Positive(message = "Target reduction must be greater than zero")
    private Double targetReduction;

    @NotNull(message = "Period in days is required")
    @Positive(message = "Period in days must be greater than zero")
    private Integer periodDays;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;
}
