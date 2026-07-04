package com.carbontrack.service;

import com.carbontrack.dto.ActivityLogRequest;
import com.carbontrack.dto.ActivityLogResponse;
import com.carbontrack.security.UserPrincipal;

import java.util.List;

public interface ActivityLogService {
    ActivityLogResponse logActivity(ActivityLogRequest request, UserPrincipal currentUser);
    List<ActivityLogResponse> getActivitiesForUser(UserPrincipal currentUser);
    void deleteActivity(Long id, UserPrincipal currentUser);
}
