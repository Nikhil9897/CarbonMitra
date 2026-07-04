package com.carbontrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse implements Serializable {
    private static final long serialVersionUID = 1L;

    private Double todayCo2;
    private Double weeklyCo2;
    private Double monthlyCo2;
    private Map<String, Double> categoryBreakdown;
    private Map<String, Double> weeklyTrend; // Date -> CO2e
    private Map<String, Double> monthlyTrend; // Month-Year -> CO2e
}
