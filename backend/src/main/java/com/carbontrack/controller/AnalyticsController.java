package com.carbontrack.controller;

import com.carbontrack.dto.ApiResponse;
import com.carbontrack.dto.AnalyticsResponse;
import com.carbontrack.security.UserPrincipal;
import com.carbontrack.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@Tag(name = "Sustainability Analytics", description = "Endpoints for footprint summaries, historical trends, and group comparisons")
@SecurityRequirement(name = "bearerAuth")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping
    @Operation(summary = "Get personal daily, weekly, monthly carbon footprint summaries and trends")
    public ResponseEntity<ApiResponse<AnalyticsResponse>> getMyAnalytics(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        AnalyticsResponse response = analyticsService.getAnalytics(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Analytics retrieved successfully", response));
    }

    @GetMapping("/organization/{orgId}")
    @Operation(summary = "Get aggregate 30-day carbon emissions for a specific organization")
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<Double>> getOrgAnalytics(
            @PathVariable Long orgId) {
        Double response = analyticsService.getOrganizationAnalytics(orgId);
        return ResponseEntity.ok(ApiResponse.success("Organization analytics retrieved successfully", response));
    }
}
