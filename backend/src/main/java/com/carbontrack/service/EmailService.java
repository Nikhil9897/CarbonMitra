package com.carbontrack.service;

import com.carbontrack.entity.User;

public interface EmailService {
    void sendWelcomeEmail(User user);
    void sendPasswordResetEmail(User user, String token);
    void sendStreakWarningEmail(User user);
    void sendWeeklyDigestEmail(User user, Double weeklyCo2, Double weeklyOffset, int badgesCount);
}
