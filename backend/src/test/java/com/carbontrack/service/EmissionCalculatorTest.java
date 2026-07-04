package com.carbontrack.service;

import com.carbontrack.entity.EmissionFactor;
import com.carbontrack.exception.ResourceNotFoundException;
import com.carbontrack.repository.EmissionFactorRepository;
import com.carbontrack.service.impl.EmissionCalculatorServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class EmissionCalculatorTest {

    @Mock
    private EmissionFactorRepository emissionFactorRepository;

    @InjectMocks
    private EmissionCalculatorServiceImpl emissionCalculatorService;

    private EmissionFactor petrolCarFactor;
    private EmissionFactor veganMealFactor;

    @BeforeEach
    void setUp() {
        petrolCarFactor = EmissionFactor.builder()
                .activityType("CAR_PETROL")
                .unit("km")
                .kgCo2ePerUnit(0.18)
                .effectiveDate(LocalDate.now())
                .build();

        veganMealFactor = EmissionFactor.builder()
                .activityType("MEAL_VEGAN")
                .unit("meals")
                .kgCo2ePerUnit(0.50)
                .effectiveDate(LocalDate.now())
                .build();
    }

    @ParameterizedTest
    @CsvSource({
            "CAR_PETROL, 100.0, 18.0",
            "CAR_PETROL, 50.0, 9.0",
            "MEAL_VEGAN, 1.0, 0.50",
            "MEAL_VEGAN, 4.0, 2.00"
    })
    void calculateEmission_shouldReturnCorrectValue(String activityType, double quantity, double expectedCo2e) {
        // Arrange
        if (activityType.equals("CAR_PETROL")) {
            when(emissionFactorRepository.findByActivityType("CAR_PETROL"))
                    .thenReturn(Optional.of(petrolCarFactor));
        } else {
            when(emissionFactorRepository.findByActivityType("MEAL_VEGAN"))
                    .thenReturn(Optional.of(veganMealFactor));
        }

        // Act
        Double actualCo2e = emissionCalculatorService.calculateEmission(activityType, quantity);

        // Assert
        assertEquals(expectedCo2e, actualCo2e, 0.001);
    }

    @Test
    void calculateEmission_shouldThrowExceptionWhenFactorNotFound() {
        // Arrange
        when(emissionFactorRepository.findByActivityType("CAR_HYBRID"))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            emissionCalculatorService.calculateEmission("CAR_HYBRID", 10.0);
        });
    }
}
