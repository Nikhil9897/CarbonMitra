package com.carbontrack.service.impl;

import com.carbontrack.dto.AnalyticsResponse;
import com.carbontrack.entity.ActivityCategory;
import com.carbontrack.entity.ActivityLog;
import com.carbontrack.repository.ActivityLogRepository;
import com.carbontrack.security.UserPrincipal;
import com.carbontrack.service.AnalyticsService;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private final ActivityLogRepository activityLogRepository;

    public AnalyticsServiceImpl(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "analytics", key = "#currentUser.id")
    public AnalyticsResponse getAnalytics(UserPrincipal currentUser) {
        Long userId = currentUser.getId();

        LocalDate today = LocalDate.now();
        LocalDateTime todayStart = today.atStartOfDay();
        LocalDateTime todayEnd = today.atTime(LocalTime.MAX);

        LocalDateTime sevenDaysAgoStart = today.minusDays(6).atStartOfDay();
        LocalDateTime thirtyDaysAgoStart = today.minusDays(29).atStartOfDay();

        // 1. Calculate Today's CO2
        Double todayCo2 = activityLogRepository.sumCo2eByUserIdAndDateRange(userId, todayStart, todayEnd);
        todayCo2 = todayCo2 != null ? todayCo2 : 0.0;

        // 2. Calculate Weekly CO2 (Last 7 days)
        Double weeklyCo2 = activityLogRepository.sumCo2eByUserIdAndDateRange(userId, sevenDaysAgoStart, todayEnd);
        weeklyCo2 = weeklyCo2 != null ? weeklyCo2 : 0.0;

        // 3. Calculate Monthly CO2 (Last 30 days)
        Double monthlyCo2 = activityLogRepository.sumCo2eByUserIdAndDateRange(userId, thirtyDaysAgoStart, todayEnd);
        monthlyCo2 = monthlyCo2 != null ? monthlyCo2 : 0.0;

        // 4. Calculate Category Breakdown (Last 30 days)
        List<Object[]> categorySums = activityLogRepository.sumCo2eByCategory(userId, thirtyDaysAgoStart);
        Map<String, Double> categoryBreakdown = new LinkedHashMap<>();
        
        // Initialize all categories with 0.0
        for (ActivityCategory category : ActivityCategory.values()) {
            categoryBreakdown.put(category.name(), 0.0);
        }
        for (Object[] row : categorySums) {
            ActivityCategory category = (ActivityCategory) row[0];
            Double total = (Double) row[1];
            categoryBreakdown.put(category.name(), Math.round(total * 100.0) / 100.0);
        }

        // Fetch logs for historical trends
        List<ActivityLog> last30DaysLogs = activityLogRepository.findByUserIdAndLogDateBetweenOrderByLogDateDesc(
                userId, thirtyDaysAgoStart, todayEnd);

        // 5. Weekly Daily Trend (Last 7 days)
        Map<String, Double> weeklyTrend = new LinkedHashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        for (int i = 6; i >= 0; i--) {
            weeklyTrend.put(today.minusDays(i).format(formatter), 0.0);
        }

        // 6. Monthly Trend (Last 30 days grouped daily for detailed charts)
        Map<String, Double> monthlyTrend = new LinkedHashMap<>();
        for (int i = 29; i >= 0; i--) {
            monthlyTrend.put(today.minusDays(i).format(formatter), 0.0);
        }

        // Map logs to trends
        for (ActivityLog log : last30DaysLogs) {
            String dateStr = log.getLogDate().format(formatter);
            if (weeklyTrend.containsKey(dateStr)) {
                weeklyTrend.put(dateStr, weeklyTrend.get(dateStr) + log.getCo2e());
            }
            if (monthlyTrend.containsKey(dateStr)) {
                monthlyTrend.put(dateStr, monthlyTrend.get(dateStr) + log.getCo2e());
            }
        }

        // Round trend values to 2 decimal places
        weeklyTrend.replaceAll((k, v) -> Math.round(v * 100.0) / 100.0);
        monthlyTrend.replaceAll((k, v) -> Math.round(v * 100.0) / 100.0);

        return AnalyticsResponse.builder()
                .todayCo2(Math.round(todayCo2 * 100.0) / 100.0)
                .weeklyCo2(Math.round(weeklyCo2 * 100.0) / 100.0)
                .monthlyCo2(Math.round(monthlyCo2 * 100.0) / 100.0)
                .categoryBreakdown(categoryBreakdown)
                .weeklyTrend(weeklyTrend)
                .monthlyTrend(monthlyTrend)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Double getOrganizationAnalytics(Long orgId) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        Double sum = activityLogRepository.sumOrganizationCo2eFromDate(orgId, thirtyDaysAgo);
        return sum != null ? Math.round(sum * 100.0) / 100.0 : 0.0;
    }
}
