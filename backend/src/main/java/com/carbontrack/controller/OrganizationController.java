package com.carbontrack.controller;

import com.carbontrack.dto.ApiResponse;
import com.carbontrack.dto.UserResponse;
import com.carbontrack.exception.BadRequestException;
import com.carbontrack.security.UserPrincipal;
import com.carbontrack.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/organization")
@Tag(name = "Organization Portal", description = "Endpoints for Organization Administrators to manage members and metrics")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'ADMIN')")
public class OrganizationController {

    private final UserService userService;

    public OrganizationController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/members")
    @Operation(summary = "Get list of all users affiliated with the Admin's organization")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getMembers(@AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser.getOrganizationId() == null) {
            throw new BadRequestException("Current admin user is not associated with any organization");
        }
        List<UserResponse> members = userService.getOrganizationMembers(currentUser.getOrganizationId());
        return ResponseEntity.ok(ApiResponse.success("Organization members retrieved successfully", members));
    }
}
