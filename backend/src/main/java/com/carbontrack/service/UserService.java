package com.carbontrack.service;

import com.carbontrack.dto.RegisterRequest;
import com.carbontrack.dto.UserResponse;
import com.carbontrack.security.UserPrincipal;

import java.util.List;

public interface UserService {
    UserResponse getCurrentUserProfile(UserPrincipal currentUser);
    UserResponse updateUserProfile(Long userId, RegisterRequest updateRequest);
    UserResponse updateCurrentUserProfile(Long userId, com.carbontrack.dto.UpdateProfileRequest request);
    List<UserResponse> getAllUsers();
    void deleteUser(Long id);
    List<UserResponse> getOrganizationMembers(Long orgId);
}
