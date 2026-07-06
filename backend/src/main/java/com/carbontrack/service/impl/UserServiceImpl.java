package com.carbontrack.service.impl;

import com.carbontrack.dto.RegisterRequest;
import com.carbontrack.dto.UserResponse;
import com.carbontrack.entity.User;
import com.carbontrack.entity.Organization;
import com.carbontrack.exception.BadRequestException;
import com.carbontrack.exception.ResourceNotFoundException;
import com.carbontrack.mapper.UserMapper;
import com.carbontrack.repository.OrganizationRepository;
import com.carbontrack.repository.UserRepository;
import com.carbontrack.security.UserPrincipal;
import com.carbontrack.service.UserService;
import org.springframework.context.ApplicationEventPublisher;
import com.carbontrack.event.PhotoUploadedEvent;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher eventPublisher;

    public UserServiceImpl(UserRepository userRepository,
                           OrganizationRepository organizationRepository,
                           PasswordEncoder passwordEncoder,
                           ApplicationEventPublisher eventPublisher) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.passwordEncoder = passwordEncoder;
        this.eventPublisher = eventPublisher;
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUserProfile(UserPrincipal currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));
        return UserMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateUserProfile(Long userId, RegisterRequest updateRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (updateRequest.getUsername() != null && !updateRequest.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(updateRequest.getUsername())) {
                throw new BadRequestException("Username is already taken!");
            }
            user.setUsername(updateRequest.getUsername());
        }

        if (updateRequest.getEmail() != null && !updateRequest.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(updateRequest.getEmail())) {
                throw new BadRequestException("Email address is already in use!");
            }
            user.setEmail(updateRequest.getEmail());
        }

        if (updateRequest.getPassword() != null && !updateRequest.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(updateRequest.getPassword()));
        }

        if (updateRequest.getOrganizationId() != null) {
            Organization organization = organizationRepository.findById(updateRequest.getOrganizationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Organization", "id", updateRequest.getOrganizationId()));
            user.setOrganization(organization);
        }

        User updatedUser = userRepository.save(user);
        return UserMapper.toResponse(updatedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAllWithOrganization().stream()
                .map(UserMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        userRepository.delete(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getOrganizationMembers(Long orgId) {
        return userRepository.findByOrganizationIdWithOrganization(orgId).stream()
                .map(UserMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserResponse updateCurrentUserProfile(Long userId, com.carbontrack.dto.UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new BadRequestException("Username is already taken!");
            }
            user.setUsername(request.getUsername());
        }

        if (request.getProfilePicture() != null && !request.getProfilePicture().isBlank()) {
            user.setProfilePicture("uploading");
            eventPublisher.publishEvent(new PhotoUploadedEvent(this, userId, request.getProfilePicture()));
        }

        User updatedUser = userRepository.save(user);
        return UserMapper.toResponse(updatedUser);
    }
}
