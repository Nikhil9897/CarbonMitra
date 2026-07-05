package com.carbontrack.repository;

import com.carbontrack.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.organization")
    List<User> findAllWithOrganization();

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.organization WHERE u.organization.id = :organizationId")
    List<User> findByOrganizationIdWithOrganization(@Param("organizationId") Long organizationId);
}
