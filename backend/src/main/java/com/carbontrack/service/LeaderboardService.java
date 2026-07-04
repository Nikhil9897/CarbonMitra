package com.carbontrack.service;

import com.carbontrack.dto.LeaderboardResponse;
import com.carbontrack.security.UserPrincipal;

import java.util.List;

public interface LeaderboardService {
    List<LeaderboardResponse> getLeaderboard(UserPrincipal currentUser);
}
