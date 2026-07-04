package com.carbontrack.controller;

import com.carbontrack.dto.ApiResponse;
import com.carbontrack.dto.ActivityLogRequest;
import com.carbontrack.dto.ActivityLogResponse;
import com.carbontrack.security.UserPrincipal;
import com.carbontrack.service.ActivityLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
@Tag(name = "Activity Logging", description = "Endpoints for logging transport, electricity, food, and shopping activities")
@SecurityRequirement(name = "bearerAuth")
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    public ActivityLogController(ActivityLogService activityLogService) {
        this.activityLogService = activityLogService;
    }

    @PostMapping
    @Operation(summary = "Log a new sustainability activity")
    public ResponseEntity<ApiResponse<ActivityLogResponse>> createActivity(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody ActivityLogRequest request) {
        ActivityLogResponse response = activityLogService.logActivity(request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Activity logged and emission calculated successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get all logged activities for the current user")
    public ResponseEntity<ApiResponse<List<ActivityLogResponse>>> getActivities(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<ActivityLogResponse> response = activityLogService.getActivitiesForUser(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Activities retrieved successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an activity log")
    public ResponseEntity<ApiResponse<String>> deleteActivity(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {
        activityLogService.deleteActivity(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Activity log deleted successfully"));
    }
}
