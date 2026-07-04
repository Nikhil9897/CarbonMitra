package com.carbontrack.service;

import com.carbontrack.entity.ActivityLog;
import com.carbontrack.entity.Goal;
import com.carbontrack.entity.GoalStatus;
import com.carbontrack.entity.User;
import com.carbontrack.entity.UserBadge;
import com.carbontrack.repository.ActivityLogRepository;
import com.carbontrack.repository.GoalRepository;
import com.carbontrack.repository.UserBadgeRepository;
import com.carbontrack.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class ScheduledEmailService {

    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;
    private final GoalRepository goalRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final EmailService emailService;

    public ScheduledEmailService(UserRepository userRepository,
                                 ActivityLogRepository activityLogRepository,
                                 GoalRepository goalRepository,
                                 UserBadgeRepository userBadgeRepository,
                                 EmailService emailService) {
        this.userRepository = userRepository;
        this.activityLogRepository = activityLogRepository;
        this.goalRepository = goalRepository;
        this.userBadgeRepository = userBadgeRepository;
        this.emailService = emailService;
    }

    // Daily check at 6 PM (18:00)
    @Scheduled(cron = "0 0 18 * * *")
    public void sendDailyStreakWarnings() {
        log.info("Starting daily streak warning email task...");
        List<User> users = userRepository.findAll();
        LocalDateTime yesterdayStart = LocalDate.now().minusDays(1).atStartOfDay();
        LocalDateTime yesterdayEnd = LocalDate.now().minusDays(1).atTime(23, 59, 59);
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime todayEnd = LocalDate.now().atTime(23, 59, 59);

        for (User user : users) {
            // Check if they logged yesterday
            List<ActivityLog> yesterdayLogs = activityLogRepository.findByUserIdAndLogDateBetweenOrderByLogDateDesc(
                    user.getId(), yesterdayStart, yesterdayEnd);
            
            // Check if they logged today
            List<ActivityLog> todayLogs = activityLogRepository.findByUserIdAndLogDateBetweenOrderByLogDateDesc(
                    user.getId(), todayStart, todayEnd);

            if (!yesterdayLogs.isEmpty() && todayLogs.isEmpty()) {
                log.info("User {} has logged yesterday but not today. Sending streak warning email...", user.getUsername());
                emailService.sendStreakWarningEmail(user);
            }
        }
        log.info("Daily streak warnings completed.");
    }

    // Weekly check every Sunday at 6 PM (18:00)
    @Scheduled(cron = "0 0 18 * * SUN")
    public void sendWeeklyDigests() {
        log.info("Starting weekly carbon digest task...");
        List<User> users = userRepository.findAll();
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);

        for (User user : users) {
            Double weeklyCo2 = activityLogRepository.sumCo2eByUserIdAndStartDate(user.getId(), sevenDaysAgo);
            weeklyCo2 = weeklyCo2 != null ? weeklyCo2 : 0.0;

            List<Goal> completedGoals = goalRepository.findByUserIdAndStatus(user.getId(), GoalStatus.COMPLETED);
            List<UserBadge> badges = userBadgeRepository.findByUserId(user.getId());

            double weeklyOffset = (completedGoals.size() * 100.0) + (badges.size() * 50.0);

            log.info("Sending weekly digest email to user {}", user.getUsername());
            emailService.sendWeeklyDigestEmail(user, weeklyCo2, weeklyOffset, badges.size());
        }
        log.info("Weekly carbon digest task completed.");
    }
}
