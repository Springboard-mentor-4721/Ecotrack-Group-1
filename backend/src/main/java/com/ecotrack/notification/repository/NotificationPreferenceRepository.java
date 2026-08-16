package com.ecotrack.notification.repository;

import com.ecotrack.notification.entity.NotificationPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Long> {
    Optional<NotificationPreference> findByUserIdAndEventType(Long userId, String eventType);
    List<NotificationPreference> findByUserId(Long userId);
}
