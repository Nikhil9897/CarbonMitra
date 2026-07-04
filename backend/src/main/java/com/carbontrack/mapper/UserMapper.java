package com.carbontrack.mapper;

import com.carbontrack.dto.UserResponse;
import com.carbontrack.entity.User;

public class UserMapper {
    public static UserResponse toResponse(User user) {
        if (user == null) {
            return null;
        }
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .enabled(user.getEnabled())
                .provider(user.getProvider().name())
                .organizationId(user.getOrganization() != null ? user.getOrganization().getId() : null)
                .organizationName(user.getOrganization() != null ? user.getOrganization().getName() : null)
                .profilePicture(user.getProfilePicture())
                .build();
    }
}
