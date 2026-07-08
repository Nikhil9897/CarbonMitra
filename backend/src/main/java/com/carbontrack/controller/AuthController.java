package com.carbontrack.controller;

import com.carbontrack.dto.*;
import com.carbontrack.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for user registration, login, token refresh, and logout")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and return JWT tokens")
    public ResponseEntity<ApiResponse<AuthResponse>> authenticateUser(@Valid @RequestBody AuthRequest authRequest) {
        AuthResponse response = authService.login(authRequest);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new local user")
    public ResponseEntity<ApiResponse<AuthResponse>> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        AuthResponse response = authService.register(registerRequest);
        return ResponseEntity.ok(ApiResponse.success("User registered successfully", response));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh expired JWT access token using a valid refresh token")
    public ResponseEntity<ApiResponse<TokenRefreshResponse>> refreshAccessToken(@Valid @RequestBody TokenRefreshRequest refreshRequest) {
        TokenRefreshResponse response = authService.refreshToken(refreshRequest);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }

    /**
     * Blacklists both the access and refresh tokens server-side via Redis,
     * preventing reuse even before their natural expiry time.
     * The frontend must also clear localStorage.
     */
    @PostMapping("/logout")
    @Operation(summary = "Logout and blacklist JWT tokens")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestBody(required = false) LogoutRequest logoutRequest,
                                                    HttpServletRequest request) {
        String accessToken = null;
        String refreshToken = null;

        // Extract access token from Authorization header
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            accessToken = bearerToken.substring(7);
        }

        // Also use tokens provided in the request body (for refresh token blacklisting)
        if (logoutRequest != null) {
            if (logoutRequest.getAccessToken() != null) {
                accessToken = logoutRequest.getAccessToken();
            }
            refreshToken = logoutRequest.getRefreshToken();
        }

        authService.logout(accessToken, refreshToken);
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request a password reset link")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success("If the email is registered, a password reset link has been sent.", null));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password using the reset token")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully. You can now log in.", null));
    }
}
