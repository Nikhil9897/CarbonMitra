package com.carbontrack.controller;

import com.carbontrack.dto.ApiResponse;
import com.carbontrack.dto.UserResponse;
import com.carbontrack.entity.EmissionFactor;
import com.carbontrack.entity.Organization;
import com.carbontrack.exception.ResourceNotFoundException;
import com.carbontrack.repository.EmissionFactorRepository;
import com.carbontrack.repository.OrganizationRepository;
import com.carbontrack.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin Portal", description = "Endpoints for administrators to manage users, organizations, and emission calculation metrics")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final OrganizationRepository organizationRepository;
    private final EmissionFactorRepository emissionFactorRepository;

    public AdminController(UserService userService,
                           OrganizationRepository organizationRepository,
                           EmissionFactorRepository emissionFactorRepository) {
        this.userService = userService;
        this.organizationRepository = organizationRepository;
        this.emissionFactorRepository = emissionFactorRepository;
    }

    @GetMapping("/users")
    @Operation(summary = "List all registered users in the platform")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success("All users retrieved successfully", userService.getAllUsers()));
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Delete a user account by ID")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully"));
    }

    @GetMapping("/organizations")
    @Operation(summary = "List all registered organizations")
    public ResponseEntity<ApiResponse<List<Organization>>> getAllOrganizations() {
        return ResponseEntity.ok(ApiResponse.success("All organizations retrieved successfully", organizationRepository.findAll()));
    }

    @GetMapping("/emission-factors")
    @Operation(summary = "List all current emission factors")
    public ResponseEntity<ApiResponse<List<EmissionFactor>>> getAllEmissionFactors() {
        return ResponseEntity.ok(ApiResponse.success("All emission factors retrieved successfully", emissionFactorRepository.findAll()));
    }

    @PutMapping("/emission-factors/{id}")
    @Operation(summary = "Update carbon emission conversion factor by ID")
    public ResponseEntity<ApiResponse<EmissionFactor>> updateEmissionFactor(
            @PathVariable Long id,
            @RequestBody EmissionFactor details) {
        EmissionFactor factor = emissionFactorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EmissionFactor", "id", id));

        factor.setKgCo2ePerUnit(details.getKgCo2ePerUnit());
        factor.setSource(details.getSource());
        factor.setEffectiveDate(details.getEffectiveDate());

        EmissionFactor updated = emissionFactorRepository.save(factor);
        return ResponseEntity.ok(ApiResponse.success("Emission factor updated successfully", updated));
    }
}
