package com.ecotrack.user.repository;

import com.ecotrack.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import com.ecotrack.common.enums.Status;
import com.ecotrack.common.enums.Role;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Page<User> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String email, Pageable pageable);

    long countByStatus(Status status);

    long countByRole(Role role);

    @org.springframework.data.jpa.repository.Query("SELECT new com.ecotrack.admin.dto.analytics.AnalyticsDistributionDTO(CAST(u.status AS string), CAST(COUNT(u) AS double)) FROM User u GROUP BY CAST(u.status AS string)")
    java.util.List<com.ecotrack.admin.dto.analytics.AnalyticsDistributionDTO> getUserStatusDistribution();

    @org.springframework.data.jpa.repository.Query("SELECT new com.ecotrack.admin.dto.analytics.AnalyticsDistributionDTO(CAST(u.role AS string), CAST(COUNT(u) AS double)) FROM User u GROUP BY CAST(u.role AS string)")
    java.util.List<com.ecotrack.admin.dto.analytics.AnalyticsDistributionDTO> getUserRoleDistribution();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :startDate AND u.createdAt < :endDate")
    long countNewUsersInPeriod(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate);

    @org.springframework.data.jpa.repository.Query("SELECT new com.ecotrack.admin.dto.analytics.AnalyticsTrendPointDTO(CAST(FUNCTION('DATE', u.createdAt) AS string), CAST(COUNT(u) AS double)) FROM User u WHERE u.createdAt >= :startDate AND u.createdAt < :endDate GROUP BY CAST(FUNCTION('DATE', u.createdAt) AS string) ORDER BY CAST(FUNCTION('DATE', u.createdAt) AS string)")
    java.util.List<com.ecotrack.admin.dto.analytics.AnalyticsTrendPointDTO> getRegistrationTrend(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate);
}
