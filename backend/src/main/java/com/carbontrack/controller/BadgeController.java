package com.carbontrack.controller;

import com.carbontrack.dto.ApiResponse;
import com.carbontrack.dto.BadgeResponse;
import com.carbontrack.security.UserPrincipal;
import com.carbontrack.service.BadgeService;
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
@RequestMapping("/api/badges")
@Tag(name = "Gamification & Badges", description = "Endpoints for viewing user badges and achievements")
@SecurityRequirement(name = "bearerAuth")
public class BadgeController {

    private final BadgeService badgeService;

    public BadgeController(BadgeService badgeService) {
        this.badgeService = badgeService;
    }

    @GetMapping
    @Operation(summary = "Get badges checklist showing awarded status for current user")
    public ResponseEntity<ApiResponse<List<BadgeResponse>>> getMyBadges(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<BadgeResponse> response = badgeService.getBadgesForUser(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Badges retrieved successfully", response));
    }

    @GetMapping("/all")
    @Operation(summary = "Get list of all badges defined in the platform")
    public ResponseEntity<ApiResponse<List<BadgeResponse>>> getAllBadges() {
        List<BadgeResponse> response = badgeService.getAllBadges();
        return ResponseEntity.ok(ApiResponse.success("All badges retrieved successfully", response));
    }
}
