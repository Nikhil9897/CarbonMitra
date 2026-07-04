package com.carbontrack.service.impl;

import com.carbontrack.dto.BadgeResponse;
import com.carbontrack.entity.*;
import com.carbontrack.repository.ActivityLogRepository;
import com.carbontrack.repository.BadgeRepository;
import com.carbontrack.repository.GoalRepository;
import com.carbontrack.repository.UserBadgeRepository;
import com.carbontrack.security.UserPrincipal;
import com.carbontrack.service.BadgeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class BadgeServiceImpl implements BadgeService {

    private static final double DAILY_BASELINE_CO2E = 15.0;

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final ActivityLogRepository activityLogRepository;
    private final GoalRepository goalRepository;

    public BadgeServiceImpl(BadgeRepository badgeRepository,
                            UserBadgeRepository userBadgeRepository,
                            ActivityLogRepository activityLogRepository,
                            GoalRepository goalRepository) {
        this.badgeRepository = badgeRepository;
        this.userBadgeRepository = userBadgeRepository;
        this.activityLogRepository = activityLogRepository;
        this.goalRepository = goalRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<BadgeResponse> getBadgesForUser(UserPrincipal currentUser) {
        List<Badge> allBadges = badgeRepository.findAll();
        List<UserBadge> userBadges = userBadgeRepository.findByUserId(currentUser.getId());
        
        Map<Long, UserBadge> userBadgeMap = userBadges.stream()
                .collect(Collectors.toMap(ub -> ub.getBadge().getId(), ub -> ub));

        return allBadges.stream().map(badge -> {
            UserBadge ub = userBadgeMap.get(badge.getId());
            return BadgeResponse.builder()
                    .id(badge.getId())
                    .name(badge.getName())
                    .description(badge.getDescription())
                    .triggerType(badge.getTriggerType().name())
                    .threshold(badge.getThreshold())
                    .awardedAt(ub != null ? ub.getAwardedAt() : null)
                    .awarded(ub != null)
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BadgeResponse> getAllBadges() {
        return badgeRepository.findAll().stream()
                .map(badge -> BadgeResponse.builder()
                        .id(badge.getId())
                        .name(badge.getName())
                        .description(badge.getDescription())
                        .triggerType(badge.getTriggerType().name())
                        .threshold(badge.getThreshold())
                        .awarded(false)
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void checkForAndAwardBadges(User user) {
        log.info("Checking badges eligibility for user: {}", user.getUsername());

        // 1. Check streaks (STREAK_DAYS)
        int streak = calculateStreak(user.getId());
        awardIfEligible(user, BadgeTriggerType.STREAK_DAYS, (double) streak);

        // 2. Check completed goals (GOAL_COMPLETED)
        long completedGoals = goalRepository.findByUserIdAndStatus(user.getId(), GoalStatus.COMPLETED).size();
        awardIfEligible(user, BadgeTriggerType.GOAL_COMPLETED, (double) completedGoals);

        // 3. Check carbon savings (CARBON_SAVED)
        double totalSaved = calculateTotalCarbonSaved(user.getId());
        awardIfEligible(user, BadgeTriggerType.CARBON_SAVED, totalSaved);
    }

    private void awardIfEligible(User user, BadgeTriggerType triggerType, Double userValue) {
        List<Badge> eligibleBadges = badgeRepository.findByTriggerType(triggerType);
        
        for (Badge badge : eligibleBadges) {
            if (userValue >= badge.getThreshold()) {
                // Check if already awarded
                boolean alreadyAwarded = userBadgeRepository.existsByUserIdAndBadgeId(user.getId(), badge.getId());
                if (!alreadyAwarded) {
                    UserBadge userBadge = UserBadge.builder()
                            .user(user)
                            .badge(badge)
                            .awardedAt(LocalDateTime.now())
                            .build();
                    userBadgeRepository.save(userBadge);
                    log.info("AWARDED BADGE: User '{}' earned badge '{}'!", user.getUsername(), badge.getName());
                }
            }
        }
    }

    private int calculateStreak(Long userId) {
        // Fetch logs dates from past 40 days
        List<java.sql.Date> dates = activityLogRepository.findDistinctLogDatesFrom(userId, LocalDateTime.now().minusDays(40));
        if (dates.isEmpty()) {
            return 0;
        }

        Set<LocalDate> logDates = dates.stream()
                .map(java.sql.Date::toLocalDate)
                .collect(Collectors.toSet());

        LocalDate checkDate = LocalDate.now();
        // If they didn't log today, check if they logged yesterday to keep streak alive
        if (!logDates.contains(checkDate)) {
            checkDate = checkDate.minusDays(1);
        }

        int streak = 0;
        while (logDates.contains(checkDate)) {
            streak++;
            checkDate = checkDate.minusDays(1);
        }

        return streak;
    }

    private double calculateTotalCarbonSaved(Long userId) {
        // Sum total CO2e emitted
        Double totalEmitted = activityLogRepository.getTotalCo2eByUserId(userId);
        if (totalEmitted == null || totalEmitted == 0) {
            return 0.0;
        }

        // Days elapsed since first activity log to now
        List<ActivityLog> logs = activityLogRepository.findByUserIdOrderByLogDateDesc(userId);
        if (logs.isEmpty()) {
            return 0.0;
        }

        LocalDate firstLogDate = logs.get(logs.size() - 1).getLogDate().toLocalDate();
        long totalDays = ChronoUnit.DAYS.between(firstLogDate, LocalDate.now()) + 1;
        totalDays = Math.max(1, totalDays);

        double totalBaseline = DAILY_BASELINE_CO2E * totalDays;
        return Math.max(0.0, totalBaseline - totalEmitted);
    }
}
