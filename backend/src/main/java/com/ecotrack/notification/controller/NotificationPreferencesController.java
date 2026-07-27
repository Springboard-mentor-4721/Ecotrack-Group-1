package com.ecotrack.notification.controller;

import com.ecotrack.notification.dto.NotificationPreferenceDTO;
import com.ecotrack.notification.entity.NotificationPreference;
import com.ecotrack.notification.repository.NotificationPreferenceRepository;
import com.ecotrack.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications/preferences")
@RequiredArgsConstructor
public class NotificationPreferencesController {

    private final NotificationPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/{eventType}")
    public ResponseEntity<NotificationPreferenceDTO> getPreference(
            @PathVariable String eventType,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        NotificationPreference pref = preferenceRepository.findByUserIdAndEventType(userId, eventType)
                .orElse(NotificationPreference.builder()
                        .userId(userId)
                        .eventType(eventType)
                        .inAppEnabled(true)
                        .emailEnabled(false)
                        .build());
        return ResponseEntity.ok(mapToDTO(pref));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PutMapping
    public ResponseEntity<NotificationPreferenceDTO> updatePreference(
            @RequestBody NotificationPreferenceDTO dto,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        NotificationPreference pref = preferenceRepository.findByUserIdAndEventType(userId, dto.getEventType())
                .orElse(NotificationPreference.builder()
                        .userId(userId)
                        .eventType(dto.getEventType())
                        .build());
        pref.setInAppEnabled(dto.getInAppEnabled() != null ? dto.getInAppEnabled() : pref.getInAppEnabled());
        pref.setEmailEnabled(dto.getEmailEnabled() != null ? dto.getEmailEnabled() : pref.getEmailEnabled());
        preferenceRepository.save(pref);
        return ResponseEntity.ok(mapToDTO(pref));
    }

    private Long getUserId(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found"))
                .getId();
    }

    private NotificationPreferenceDTO mapToDTO(NotificationPreference pref) {
        return NotificationPreferenceDTO.builder()
                .eventType(pref.getEventType())
                .inAppEnabled(pref.getInAppEnabled())
                .emailEnabled(pref.getEmailEnabled())
                .build();
    }
}
