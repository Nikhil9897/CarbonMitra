package com.carbontrack.service;

import com.carbontrack.dto.GoalPredictionResponse;
import com.carbontrack.dto.GoalProgressResponse;
import com.carbontrack.dto.GoalRequest;
import com.carbontrack.dto.GoalResponse;
import com.carbontrack.security.UserPrincipal;

import java.util.List;

public interface GoalService {
    GoalResponse createGoal(GoalRequest request, UserPrincipal currentUser);
    GoalResponse updateGoal(Long goalId, GoalRequest request, UserPrincipal currentUser);
    void deleteGoal(Long goalId, UserPrincipal currentUser);
    List<GoalResponse> getGoalsForUser(UserPrincipal currentUser);
    GoalProgressResponse getGoalProgress(Long goalId, UserPrincipal currentUser);
    GoalPredictionResponse predictGoalCompletion(Long goalId, UserPrincipal currentUser);
    void checkAndUpdateGoalsProgress();
}
