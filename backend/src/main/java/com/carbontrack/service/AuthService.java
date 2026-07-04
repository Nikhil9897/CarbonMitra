package com.carbontrack.service;

import com.carbontrack.dto.AuthRequest;
import com.carbontrack.dto.AuthResponse;
import com.carbontrack.dto.RegisterRequest;
import com.carbontrack.dto.TokenRefreshResponse;
import com.carbontrack.dto.TokenRefreshRequest;

public interface AuthService {
    AuthResponse login(AuthRequest authRequest);
    AuthResponse register(RegisterRequest registerRequest);
    TokenRefreshResponse refreshToken(TokenRefreshRequest tokenRefreshRequest);
    void forgotPassword(com.carbontrack.dto.ForgotPasswordRequest forgotPasswordRequest);
    void resetPassword(com.carbontrack.dto.ResetPasswordRequest resetPasswordRequest);
}
