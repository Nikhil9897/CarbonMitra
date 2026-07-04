package com.carbontrack.repository;

import com.carbontrack.entity.Badge;
import com.carbontrack.entity.BadgeTriggerType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BadgeRepository extends JpaRepository<Badge, Long> {
    Optional<Badge> findByName(String name);
    List<Badge> findByTriggerType(BadgeTriggerType triggerType);
}
