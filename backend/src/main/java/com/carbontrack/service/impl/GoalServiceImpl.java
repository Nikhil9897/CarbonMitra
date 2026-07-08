package com.carbontrack.service.impl;

import com.carbontrack.dto.GoalPredictionResponse;
import com.carbontrack.dto.GoalProgressResponse;
import com.carbontrack.dto.GoalRequest;
import com.carbontrack.dto.GoalResponse;
import com.carbontrack.entity.Goal;
import com.carbontrack.entity.GoalStatus;
import com.carbontrack.entity.Role;
import com.carbontrack.entity.User;
import com.carbontrack.exception.BadRequestException;
import com.carbontrack.exception.ResourceNotFoundException;
import com.carbontrack.mapper.GoalMapper;
import com.carbontrack.repository.ActivityLogRepository;
import com.carbontrack.repository.GoalRepository;
import com.carbontrack.repository.UserRepository;
import com.carbontrack.security.UserPrincipal;
import com.carbontrack.service.GoalService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GoalServiceImpl implements GoalService {

    private static final double DAILY_BASELINE_CO2E = 15.0; // In kg CO2e per day

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;

    public GoalServiceImpl(GoalRepository goalRepository,
                           UserRepository userRepository,
                           ActivityLogRepository activityLogRepository,
                           org.springframework.context.ApplicationEventPublisher eventPublisher) {
        this.goalRepository = goalRepository;
        this.userRepository = userRepository;
        this.activityLogRepository = activityLogRepository;
        this.eventPublisher = eventPublisher;
    }

    @Override
    @Transactional
    public GoalResponse createGoal(GoalRequest request, UserPrincipal currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        // Ensure user does not have multiple active goals (limit 3 active goals max to stay focused)
        List<Goal> activeGoals = goalRepository.findByUserIdAndStatus(currentUser.getId(), GoalStatus.ACTIVE);
        if (activeGoals.size() >= 3) {
            throw new BadRequestException("You can have a maximum of 3 active goals at the same time.");
        }

        Goal goal = Goal.builder()
                .user(user)
                .targetReduction(request.getTargetReduction())
                .periodDays(request.getPeriodDays())
                .startDate(request.getStartDate())
                .status(GoalStatus.ACTIVE)
                .build();

        goal = goalRepository.save(goal);
        eventPublisher.publishEvent(new com.carbontrack.event.EventCreatedEvent(this, goal));
        return GoalMapper.toResponse(goal);
    }

    @Override
    @Transactional
    public GoalResponse updateGoal(Long goalId, GoalRequest request, UserPrincipal currentUser) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal", "id", goalId));

        if (!goal.getUser().getId().equals(currentUser.getId()) && !currentUser.getAuthorities().toString().contains(Role.ROLE_ADMIN.name())) {
            throw new AccessDeniedException("You do not have permission to update this goal.");
        }

        goal.setTargetReduction(request.getTargetReduction());
        goal.setPeriodDays(request.getPeriodDays());
        goal.setStartDate(request.getStartDate());

        goal = goalRepository.save(goal);
        return GoalMapper.toResponse(goal);
    }

    @Override
    @Transactional
    public void deleteGoal(Long goalId, UserPrincipal currentUser) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal", "id", goalId));

        if (!goal.getUser().getId().equals(currentUser.getId()) && !currentUser.getAuthorities().toString().contains(Role.ROLE_ADMIN.name())) {
            throw new AccessDeniedException("You do not have permission to delete this goal.");
        }

        goalRepository.delete(goal);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GoalResponse> getGoalsForUser(UserPrincipal currentUser) {
        return goalRepository.findByUserId(currentUser.getId()).stream()
                .map(GoalMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public GoalProgressResponse getGoalProgress(Long goalId, UserPrincipal currentUser) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal", "id", goalId));

        if (!goal.getUser().getId().equals(currentUser.getId()) && !currentUser.getAuthorities().toString().contains(Role.ROLE_ADMIN.name())) {
            throw new AccessDeniedException("You do not have permission to view progress for this goal.");
        }

        LocalDate now = LocalDate.now();
        long daysElapsed = ChronoUnit.DAYS.between(goal.getStartDate(), now) + 1;
        daysElapsed = Math.max(1, Math.min(goal.getPeriodDays(), daysElapsed));

        LocalDateTime startDateTime = goal.getStartDate().atStartOfDay();
        LocalDateTime endDateTime = goal.getStartDate().plusDays(goal.getPeriodDays()).atTime(LocalTime.MAX);
        LocalDateTime currentLimit = now.atTime(LocalTime.MAX);
        if (currentLimit.isAfter(endDateTime)) {
            currentLimit = endDateTime;
        }

        Double actualEmissions = activityLogRepository.sumCo2eByUserIdAndDateRange(goal.getUser().getId(), startDateTime, currentLimit);
        if (actualEmissions == null) {
            actualEmissions = 0.0;
        }

        double baselineEmissions = DAILY_BASELINE_CO2E * daysElapsed;
        double carbonSaved = Math.max(0.0, baselineEmissions - actualEmissions);
        double percentComplete = Math.min(100.0, (carbonSaved / goal.getTargetReduction()) * 100.0);
        long daysRemaining = Math.max(0, goal.getPeriodDays() - ChronoUnit.DAYS.between(goal.getStartDate(), now));

        return GoalProgressResponse.builder()
                .goalId(goal.getId())
                .targetReduction(goal.getTargetReduction())
                .periodDays(goal.getPeriodDays())
                .startDate(goal.getStartDate())
                .status(goal.getStatus().name())
                .baselineEmissions(baselineEmissions)
                .actualEmissions(actualEmissions)
                .carbonSaved(carbonSaved)
                .percentComplete(percentComplete)
                .daysRemaining(daysRemaining)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public GoalPredictionResponse predictGoalCompletion(Long goalId, UserPrincipal currentUser) {
        GoalProgressResponse progress = getGoalProgress(goalId, currentUser);
        LocalDate now = LocalDate.now();
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal", "id", goalId));

        long daysElapsed = ChronoUnit.DAYS.between(progress.getStartDate(), now) + 1;
        daysElapsed = Math.max(1, daysElapsed);

        double currentDailySavingRate = progress.getCarbonSaved() / daysElapsed;
        double carbonRemaining = Math.max(0.0, progress.getTargetReduction() - progress.getCarbonSaved());

        double dailySavingRateNeeded = progress.getDaysRemaining() > 0 ? carbonRemaining / progress.getDaysRemaining() : 0.0;
        boolean onTrack = currentDailySavingRate >= dailySavingRateNeeded;

        LocalDate estimatedCompletionDate = null;
        if (progress.getCarbonSaved() >= progress.getTargetReduction()) {
            estimatedCompletionDate = now;
        } else if (currentDailySavingRate > 0.01) {
            long daysToTarget = (long) Math.ceil(carbonRemaining / currentDailySavingRate);
            estimatedCompletionDate = now.plusDays(daysToTarget);
        }

        String predictedStatus = onTrack ? "WILL_ACHIEVE" : "BEHIND_SCHEDULE";
        if (progress.getStatus().equals(GoalStatus.COMPLETED.name())) {
            predictedStatus = "COMPLETED";
        } else if (progress.getStatus().equals(GoalStatus.FAILED.name())) {
            predictedStatus = "FAILED";
        }

        return GoalPredictionResponse.builder()
                .goalId(goalId)
                .targetReduction(progress.getTargetReduction())
                .daysRemaining(progress.getDaysRemaining())
                .dailySavingRateNeeded(dailySavingRateNeeded)
                .currentDailySavingRate(currentDailySavingRate)
                .onTrack(onTrack)
                .predictedStatus(predictedStatus)
                .estimatedCompletionDate(estimatedCompletionDate)
                .build();
    }

    @Override
    @Transactional
    public void checkAndUpdateGoalsProgress(Long userId) {
        List<Goal> activeGoals = goalRepository.findByUserIdAndStatus(userId, GoalStatus.ACTIVE);
        LocalDate now = LocalDate.now();

        for (Goal goal : activeGoals) {
            LocalDate endDate = goal.getStartDate().plusDays(goal.getPeriodDays());
            if (now.isAfter(endDate) || now.isEqual(endDate)) {
                // Period has ended, evaluate goal completion
                LocalDateTime startDateTime = goal.getStartDate().atStartOfDay();
                LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

                Double actualEmissions = activityLogRepository.sumCo2eByUserIdAndDateRange(goal.getUser().getId(), startDateTime, endDateTime);
                if (actualEmissions == null) {
                    actualEmissions = 0.0;
                }

                double baselineEmissions = DAILY_BASELINE_CO2E * goal.getPeriodDays();
                double carbonSaved = Math.max(0.0, baselineEmissions - actualEmissions);

                if (carbonSaved >= goal.getTargetReduction()) {
                    goal.setStatus(GoalStatus.COMPLETED);
                } else {
                    goal.setStatus(GoalStatus.FAILED);
                }
                goalRepository.save(goal);
            }
        }
    }
}
