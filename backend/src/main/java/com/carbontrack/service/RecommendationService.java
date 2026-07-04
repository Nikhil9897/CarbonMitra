package com.carbontrack.service;

import com.carbontrack.dto.RecommendationResponse;
import com.carbontrack.security.UserPrincipal;

public interface RecommendationService {
    RecommendationResponse getRecommendations(UserPrincipal currentUser);
}
