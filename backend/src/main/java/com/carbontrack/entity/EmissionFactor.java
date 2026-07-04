package com.carbontrack.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "emission_factors")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmissionFactor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "activity_type", nullable = false, unique = true, length = 100)
    private String activityType;

    @Column(nullable = false, length = 50)
    private String unit;

    @Column(name = "kg_co2e_per_unit", nullable = false)
    private Double kgCo2ePerUnit;

    @Column(length = 255)
    private String source;

    @Column(name = "effective_date", nullable = false)
    private LocalDate effectiveDate;
}
