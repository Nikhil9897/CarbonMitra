package com.carbontrack.controller;

import com.carbontrack.dto.ApiResponse;
import com.carbontrack.dto.LeaderboardResponse;
import com.carbontrack.security.UserPrincipal;
import com.carbontrack.service.LeaderboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
@Tag(name = "Leaderboard", description = "Endpoints for viewing the carbon footprint community leaderboard")
@SecurityRequirement(name = "bearerAuth")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    public LeaderboardController(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    @GetMapping
    @Operation(summary = "Get top 50 users sorted by lowest carbon footprint")
    public ResponseEntity<ApiResponse<List<LeaderboardResponse>>> getLeaderboard(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<LeaderboardResponse> response = leaderboardService.getLeaderboard(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Leaderboard retrieved successfully", response));
    }
}
