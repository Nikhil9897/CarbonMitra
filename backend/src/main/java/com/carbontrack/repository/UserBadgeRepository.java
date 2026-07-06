package com.carbontrack.repository;

import com.carbontrack.entity.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {
    List<UserBadge> findByUserId(Long userId);
    boolean existsByUserIdAndBadgeId(Long userId, Long badgeId);

    @Query("SELECT ub.user.id, COUNT(ub) FROM UserBadge ub WHERE ub.user.id IN :userIds GROUP BY ub.user.id")
    List<Object[]> countBadgesByUserIds(@Param("userIds") List<Long> userIds);
}
