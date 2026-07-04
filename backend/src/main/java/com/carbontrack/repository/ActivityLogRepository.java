package com.carbontrack.repository;

import com.carbontrack.entity.ActivityCategory;
import com.carbontrack.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findByUserIdOrderByLogDateDesc(Long userId);
    
    List<ActivityLog> findByUserIdAndLogDateBetweenOrderByLogDateDesc(Long userId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT COALESCE(SUM(al.co2e), 0.0) FROM ActivityLog al WHERE al.user.id = :userId")
    Double getTotalCo2eByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(al.co2e), 0.0) FROM ActivityLog al WHERE al.user.id = :userId AND al.logDate >= :startDate")
    Double sumCo2eByUserIdAndStartDate(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate);

    @Query("SELECT COALESCE(SUM(al.co2e), 0.0) FROM ActivityLog al WHERE al.user.id = :userId AND al.logDate BETWEEN :startDate AND :endDate")
    Double sumCo2eByUserIdAndDateRange(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT al.category as category, COALESCE(SUM(al.co2e), 0.0) as total " +
           "FROM ActivityLog al WHERE al.user.id = :userId AND al.logDate >= :startDate " +
           "GROUP BY al.category")
    List<Object[]> sumCo2eByCategory(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate);

    @Query("SELECT DATE(al.logDate) FROM ActivityLog al WHERE al.user.id = :userId AND al.logDate >= :startDate ORDER BY DATE(al.logDate) DESC")
    List<java.sql.Date> findDistinctLogDatesFrom(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate);

    @Query("SELECT al.user.id as userId, " +
           "COALESCE(u.username, 'Anonymous') as username, " +
           "COALESCE(SUM(al.co2e), 0.0) as totalCo2e " +
           "FROM ActivityLog al " +
           "JOIN al.user u " +
           "WHERE u.enabled = true " +
           "GROUP BY al.user.id, u.username " +
           "ORDER BY totalCo2e ASC")
    List<Object[]> getLeaderboardData();

    @Query("SELECT COALESCE(SUM(al.co2e), 0.0) FROM ActivityLog al " +
           "JOIN al.user u " +
           "WHERE u.organization.id = :orgId AND al.logDate >= :startDate")
    Double sumOrganizationCo2eFromDate(@Param("orgId") Long orgId, @Param("startDate") LocalDateTime startDate);
}
