package com.carbontrack.controller;

import com.carbontrack.dto.ApiResponse;
import com.carbontrack.dto.RecommendationResponse;
import com.carbontrack.security.UserPrincipal;
import com.carbontrack.service.RecommendationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recommendations")
@Tag(name = "Recommendation Engine", description = "Endpoints for retrieving personalized environmental impact reduction tips")
@SecurityRequirement(name = "bearerAuth")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping
    @Operation(summary = "Get personalized carbon reduction recommendations based on last 30 days activities")
    public ResponseEntity<ApiResponse<RecommendationResponse>> getRecommendations(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        RecommendationResponse response = recommendationService.getRecommendations(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Recommendations generated successfully", response));
    }
}
