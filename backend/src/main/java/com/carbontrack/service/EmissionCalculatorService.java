package com.carbontrack.service;

public interface EmissionCalculatorService {
    Double calculateEmission(String activityType, Double quantity);
    String getStandardUnit(String activityType);
}
