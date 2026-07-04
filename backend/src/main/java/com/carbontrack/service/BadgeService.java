package com.carbontrack.service;

import com.carbontrack.dto.BadgeResponse;
import com.carbontrack.entity.User;
import com.carbontrack.security.UserPrincipal;

import java.util.List;

public interface BadgeService {
    List<BadgeResponse> getBadgesForUser(UserPrincipal currentUser);
    List<BadgeResponse> getAllBadges();
    void checkForAndAwardBadges(User user);
}
