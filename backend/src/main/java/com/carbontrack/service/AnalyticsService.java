package com.carbontrack.service;

import com.carbontrack.dto.AnalyticsResponse;
import com.carbontrack.security.UserPrincipal;

public interface AnalyticsService {
    AnalyticsResponse getAnalytics(UserPrincipal currentUser);
    Double getOrganizationAnalytics(Long orgId);
}
