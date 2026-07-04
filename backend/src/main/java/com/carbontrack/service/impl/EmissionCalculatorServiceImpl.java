package com.carbontrack.service.impl;

import com.carbontrack.entity.EmissionFactor;
import com.carbontrack.exception.ResourceNotFoundException;
import com.carbontrack.repository.EmissionFactorRepository;
import com.carbontrack.service.EmissionCalculatorService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EmissionCalculatorServiceImpl implements EmissionCalculatorService {

    private final EmissionFactorRepository emissionFactorRepository;

    public EmissionCalculatorServiceImpl(EmissionFactorRepository emissionFactorRepository) {
        this.emissionFactorRepository = emissionFactorRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Double calculateEmission(String activityType, Double quantity) {
        EmissionFactor factor = emissionFactorRepository.findByActivityType(activityType)
                .orElseThrow(() -> new ResourceNotFoundException("EmissionFactor", "activityType", activityType));
        return quantity * factor.getKgCo2ePerUnit();
    }

    @Override
    @Transactional(readOnly = true)
    public String getStandardUnit(String activityType) {
        EmissionFactor factor = emissionFactorRepository.findByActivityType(activityType)
                .orElseThrow(() -> new ResourceNotFoundException("EmissionFactor", "activityType", activityType));
        return factor.getUnit();
    }
}
