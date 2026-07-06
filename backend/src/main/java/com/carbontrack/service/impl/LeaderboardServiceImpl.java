package com.carbontrack.service.impl;

import com.carbontrack.dto.LeaderboardResponse;
import com.carbontrack.repository.ActivityLogRepository;
import com.carbontrack.repository.UserBadgeRepository;
import com.carbontrack.security.UserPrincipal;
import com.carbontrack.service.LeaderboardService;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class LeaderboardServiceImpl implements LeaderboardService {

    private final ActivityLogRepository activityLogRepository;
    private final UserBadgeRepository userBadgeRepository;

    public LeaderboardServiceImpl(ActivityLogRepository activityLogRepository,
                                  UserBadgeRepository userBadgeRepository) {
        this.activityLogRepository = activityLogRepository;
        this.userBadgeRepository = userBadgeRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaderboardResponse> getLeaderboard(UserPrincipal currentUser) {
        // Fetch raw data which can be mapped/anonymized dynamically
        List<Object[]> rawData = getCachedLeaderboardData();
        List<LeaderboardResponse> leaderboard = new ArrayList<>();

        // Extract user IDs to fetch badge counts in a single batch query
        java.util.List<Long> userIds = rawData.stream()
                .map(row -> (Long) row[0])
                .collect(java.util.stream.Collectors.toList());
        
        java.util.Map<Long, Long> badgeCountsMap = new java.util.HashMap<>();
        if (!userIds.isEmpty()) {
            List<Object[]> badgeCounts = userBadgeRepository.countBadgesByUserIds(userIds);
            for (Object[] countRow : badgeCounts) {
                badgeCountsMap.put((Long) countRow[0], (Long) countRow[1]);
            }
        }

        int rank = 1;
        for (Object[] row : rawData) {
            Long userId = (Long) row[0];
            String username = (String) row[1];
            Double totalCo2e = (Double) row[2];

            // Anonymize other users
            String displayUsername = username;
            if (currentUser == null || !userId.equals(currentUser.getId())) {
                displayUsername = anonymizeUsername(username);
            }

            int badgesCount = badgeCountsMap.getOrDefault(userId, 0L).intValue();

            leaderboard.add(LeaderboardResponse.builder()
                    .userId(userId)
                    .username(displayUsername)
                    .totalCo2e(Math.round(totalCo2e * 100.0) / 100.0)
                    .rank(rank++)
                    .badgesCount(badgesCount)
                    .build());
            
            // Limit to Top 50 Users
            if (rank > 50) {
                break;
            }
        }

        return leaderboard;
    }

    // Cache the database retrieval to avoid heavy aggregations on every request
    @Cacheable(value = "leaderboard", key = "'raw_data'")
    public List<Object[]> getCachedLeaderboardData() {
        return activityLogRepository.getLeaderboardData();
    }

    private String anonymizeUsername(String username) {
        if (username == null || username.length() < 3) {
            return "Anonymous";
        }
        return username.charAt(0) + "***" + username.charAt(username.length() - 1);
    }
}
