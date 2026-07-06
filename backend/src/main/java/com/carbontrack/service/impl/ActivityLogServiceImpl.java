package com.carbontrack.service.impl;

import com.carbontrack.dto.ActivityLogRequest;
import com.carbontrack.dto.ActivityLogResponse;
import com.carbontrack.entity.ActivityLog;
import com.carbontrack.entity.Role;
import com.carbontrack.entity.User;
import com.carbontrack.event.ActivityLoggedEvent;
import com.carbontrack.exception.BadRequestException;
import com.carbontrack.exception.ResourceNotFoundException;
import com.carbontrack.mapper.ActivityLogMapper;
import com.carbontrack.repository.ActivityLogRepository;
import com.carbontrack.repository.UserRepository;
import com.carbontrack.security.UserPrincipal;
import com.carbontrack.service.ActivityLogService;
import com.carbontrack.service.EmissionCalculatorService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ActivityLogServiceImpl implements ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;
    private final EmissionCalculatorService emissionCalculatorService;
    private final ApplicationEventPublisher eventPublisher;

    public ActivityLogServiceImpl(ActivityLogRepository activityLogRepository,
                                  UserRepository userRepository,
                                  EmissionCalculatorService emissionCalculatorService,
                                  ApplicationEventPublisher eventPublisher) {
        this.activityLogRepository = activityLogRepository;
        this.userRepository = userRepository;
        this.emissionCalculatorService = emissionCalculatorService;
        this.eventPublisher = eventPublisher;
    }

    @Override
    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "dashboard", key = "#currentUser.id"),
        @CacheEvict(value = "analytics", key = "#currentUser.id"),
        @CacheEvict(value = "leaderboard", allEntries = true)
    })
    public ActivityLogResponse logActivity(ActivityLogRequest request, UserPrincipal currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        // Perform calculation using the DB-driven Emission Calculation Engine
        Double calculatedCo2e = emissionCalculatorService.calculateEmission(request.getActivityType(), request.getQuantity());

        // Validate units if they differ from expectations
        String expectedUnit = emissionCalculatorService.getStandardUnit(request.getActivityType());
        if (!expectedUnit.equalsIgnoreCase(request.getUnit())) {
            throw new BadRequestException("Invalid unit: '" + request.getUnit() + "' for activity: " + request.getActivityType() + ". Expected: '" + expectedUnit + "'");
        }

        ActivityLog log = ActivityLog.builder()
                .user(user)
                .category(request.getCategory())
                .activityType(request.getActivityType())
                .quantity(request.getQuantity())
                .unit(request.getUnit())
                .co2e(calculatedCo2e)
                .logDate(request.getLogDate() != null ? request.getLogDate() : LocalDateTime.now())
                .build();

        log = activityLogRepository.save(log);

        // Publish Spring Application Event for decoupled tasks (Goal checks, badge updates)
        eventPublisher.publishEvent(new ActivityLoggedEvent(this, log));

        // Publish CarbonCalculatedEvent for decoupled async calculations audit/stats
        eventPublisher.publishEvent(new com.carbontrack.event.CarbonCalculatedEvent(this, user.getId(), log.getActivityType(), log.getCo2e()));

        return ActivityLogMapper.toResponse(log);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActivityLogResponse> getActivitiesForUser(UserPrincipal currentUser) {
        return activityLogRepository.findByUserIdOrderByLogDateDesc(currentUser.getId()).stream()
                .map(ActivityLogMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "dashboard", key = "#currentUser.id"),
        @CacheEvict(value = "analytics", key = "#currentUser.id"),
        @CacheEvict(value = "leaderboard", allEntries = true)
    })
    public void deleteActivity(Long id, UserPrincipal currentUser) {
        ActivityLog log = activityLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ActivityLog", "id", id));

        // Enforce owner verification
        if (!log.getUser().getId().equals(currentUser.getId()) && !currentUser.getAuthorities().toString().contains(Role.ROLE_ADMIN.name())) {
            throw new AccessDeniedException("You do not have permission to delete this activity log");
        }

        activityLogRepository.delete(log);
    }
}
