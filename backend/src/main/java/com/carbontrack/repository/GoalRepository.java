package com.carbontrack.repository;

import com.carbontrack.entity.Goal;
import com.carbontrack.entity.GoalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByUserId(Long userId);
    List<Goal> findByUserIdAndStatus(Long userId, GoalStatus status);
    List<Goal> findByStatus(GoalStatus status);
}
