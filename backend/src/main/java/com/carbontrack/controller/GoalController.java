package com.carbontrack.controller;

import com.carbontrack.dto.*;
import com.carbontrack.security.UserPrincipal;
import com.carbontrack.service.GoalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@Tag(name = "Goal Tracking", description = "Endpoints for setting, monitoring, and predicting carbon reduction goals")
@SecurityRequirement(name = "bearerAuth")
public class GoalController {

    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    @PostMapping
    @Operation(summary = "Set a new carbon reduction goal")
    public ResponseEntity<ApiResponse<GoalResponse>> createGoal(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody GoalRequest request) {
        GoalResponse response = goalService.createGoal(request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Goal set successfully", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing carbon reduction goal")
    public ResponseEntity<ApiResponse<GoalResponse>> updateGoal(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id,
            @Valid @RequestBody GoalRequest request) {
        GoalResponse response = goalService.updateGoal(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Goal updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a carbon reduction goal")
    public ResponseEntity<ApiResponse<String>> deleteGoal(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {
        goalService.deleteGoal(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Goal deleted successfully"));
    }

    @GetMapping
    @Operation(summary = "Get all goals for the current authenticated user")
    public ResponseEntity<ApiResponse<List<GoalResponse>>> getGoals(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<GoalResponse> response = goalService.getGoalsForUser(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Goals retrieved successfully", response));
    }

    @GetMapping("/{id}/progress")
    @Operation(summary = "Get progress details for a specific goal")
    public ResponseEntity<ApiResponse<GoalProgressResponse>> getProgress(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {
        GoalProgressResponse response = goalService.getGoalProgress(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Goal progress retrieved successfully", response));
    }

    @GetMapping("/{id}/prediction")
    @Operation(summary = "Predict completion status and date for a specific goal")
    public ResponseEntity<ApiResponse<GoalPredictionResponse>> getPrediction(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {
        GoalPredictionResponse response = goalService.predictGoalCompletion(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Goal completion prediction retrieved successfully", response));
    }
}
