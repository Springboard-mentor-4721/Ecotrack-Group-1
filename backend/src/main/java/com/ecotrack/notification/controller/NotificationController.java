package com.ecotrack.notification.controller;

import com.ecotrack.notification.dto.NotificationDTO;
import com.ecotrack.notification.entity.Notification;
import com.ecotrack.notification.repository.NotificationRepository;
import com.ecotrack.notification.service.NotificationService;
import com.ecotrack.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping
    public ResponseEntity<Page<NotificationDTO>> getNotifications(Pageable pageable, Authentication authentication) {
        Long userId = getUserId(authentication);
        Page<NotificationDTO> page = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapToDTO);
        return ResponseEntity.ok(page);
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id, Authentication authentication) {
        Long userId = getUserId(authentication);
        Notification notif = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        if (!notif.getUserId().equals(userId)) {
            throw new org.springframework.security.access.AccessDeniedException("Not owner");
        }
        notif.setIsRead(true);
        notificationRepository.save(notif);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(Authentication authentication) {
        Long userId = getUserId(authentication);
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(count);
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        Long userId = getUserId(authentication);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    private Long getUserId(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found"))
                .getId();
    }

    private NotificationDTO mapToDTO(Notification notif) {
        return NotificationDTO.builder()
                .id(notif.getId())
                .userId(notif.getUserId())
                .type(notif.getType())
                .title(notif.getTitle())
                .message(notif.getMessage())
                .entityType(notif.getEntityType())
                .entityId(notif.getEntityId())
                .isRead(notif.getIsRead())
                .createdAt(notif.getCreatedAt())
                .build();
    }
}
