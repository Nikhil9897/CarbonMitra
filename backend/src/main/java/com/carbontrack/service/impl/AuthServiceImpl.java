package com.carbontrack.service.impl;

import com.carbontrack.dto.*;
import com.carbontrack.entity.AuthProvider;
import com.carbontrack.entity.Organization;
import com.carbontrack.entity.Role;
import com.carbontrack.entity.User;
import com.carbontrack.exception.BadRequestException;
import com.carbontrack.exception.ResourceNotFoundException;
import com.carbontrack.exception.TokenRefreshException;
import com.carbontrack.repository.OrganizationRepository;
import com.carbontrack.repository.UserRepository;
import com.carbontrack.security.JwtTokenProvider;
import com.carbontrack.security.UserPrincipal;
import com.carbontrack.service.AuthService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.carbontrack.event.UserRegisteredEvent;
import com.carbontrack.entity.PasswordResetToken;
import com.carbontrack.repository.PasswordResetTokenRepository;
import com.carbontrack.service.EmailService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final ApplicationEventPublisher eventPublisher;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           UserRepository userRepository,
                           OrganizationRepository organizationRepository,
                           PasswordEncoder passwordEncoder,
                           JwtTokenProvider tokenProvider,
                           ApplicationEventPublisher eventPublisher,
                           PasswordResetTokenRepository passwordResetTokenRepository,
                           EmailService emailService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.eventPublisher = eventPublisher;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailService = emailService;
    }

    @Override
    public AuthResponse login(AuthRequest authRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        authRequest.getUsernameOrEmail(),
                        authRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userPrincipal.getId()));

        Long orgId = user.getOrganization() != null ? user.getOrganization().getId() : null;
        String orgName = user.getOrganization() != null ? user.getOrganization().getName() : null;

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .organizationId(orgId)
                .organizationName(orgName)
                .build();
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new BadRequestException("Username is already taken!");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Email Address already in use!");
        }

        Role userRole = Role.ROLE_USER;
        if (registerRequest.getRole() != null) {
            try {
                userRole = Role.valueOf(registerRequest.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid role specified. Must be ROLE_USER, ROLE_ADMIN or ROLE_ORGANIZATION_ADMIN");
            }
        }

        Organization organization = null;
        boolean isNewOrg = false;

        // If registering as Org Admin and wants to create new organization
        if (userRole == Role.ROLE_ORGANIZATION_ADMIN && registerRequest.getOrganizationName() != null) {
            String orgName = registerRequest.getOrganizationName().trim();
            if (organizationRepository.existsByName(orgName)) {
                throw new BadRequestException("Organization name already exists!");
            }
            organization = Organization.builder().name(orgName).build();
            organization = organizationRepository.save(organization);
            isNewOrg = true;
        } 
        // Or if joining an existing organization
        else if (registerRequest.getOrganizationId() != null) {
            organization = organizationRepository.findById(registerRequest.getOrganizationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Organization", "id", registerRequest.getOrganizationId()));
        }

        User user = User.builder()
                .username(registerRequest.getUsername())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role(userRole)
                .provider(AuthProvider.LOCAL)
                .enabled(true)
                .organization(organization)
                .build();

        user = userRepository.save(user);

        // Publish registration event for welcoming the user
        eventPublisher.publishEvent(new UserRegisteredEvent(this, user));

        if (isNewOrg) {
            organization.setAdminUser(user);
            organizationRepository.save(organization);
        }

        // Generate tokens directly for seamless auto-login on sign-up
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                UserPrincipal.create(user), null, UserPrincipal.create(user).getAuthorities()
        );
        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .organizationId(organization != null ? organization.getId() : null)
                .organizationName(organization != null ? organization.getName() : null)
                .build();
    }

    @Override
    public TokenRefreshResponse refreshToken(TokenRefreshRequest tokenRefreshRequest) {
        String requestRefreshToken = tokenRefreshRequest.getRefreshToken();

        if (tokenProvider.validateToken(requestRefreshToken)) {
            String username = tokenProvider.getUsernameFromJWT(requestRefreshToken);
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new TokenRefreshException(requestRefreshToken, "User not found associated with this token"));

            // Rotate refresh token as well for security
            String newAccessToken = tokenProvider.generateTokenFromUsername(username, 3600000); // 1hr
            String newRefreshToken = tokenProvider.generateTokenFromUsername(username, 604800000); // 7days

            return TokenRefreshResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(newRefreshToken)
                    .build();
        } else {
            throw new TokenRefreshException(requestRefreshToken, "Refresh token is invalid or expired");
        }
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        if (user.getProvider() != AuthProvider.LOCAL) {
            throw new BadRequestException("Social accounts cannot request a password reset.");
        }

        // Delete any existing tokens for this user
        passwordResetTokenRepository.deleteByUser(user);

        String token = java.util.UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(java.time.LocalDateTime.now().plusMinutes(15))
                .build();

        passwordResetTokenRepository.save(resetToken);

        emailService.sendPasswordResetEmail(user, token);
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new ResourceNotFoundException("PasswordResetToken", "token", request.getToken()));

        if (resetToken.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new BadRequestException("Password reset link has expired.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        passwordResetTokenRepository.delete(resetToken);
    }
}
