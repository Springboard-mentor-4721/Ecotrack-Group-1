package com.ecotrack.notification.controller;

import com.ecotrack.notification.dto.NotificationPreferenceBulkRequest;
import com.ecotrack.notification.dto.NotificationPreferenceDTO;
import com.ecotrack.notification.entity.NotificationPreference;
import com.ecotrack.notification.repository.NotificationPreferenceRepository;
import com.ecotrack.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Arrays;

@RestController
@RequestMapping("/api/notifications/preferences")
@RequiredArgsConstructor
public class NotificationPreferencesController {

    private final NotificationPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;
    
    private final List<String> ALL_EVENT_TYPES = Arrays.asList(
        "BADGE_EARNED", "CHALLENGE_COMPLETED", "GOAL_ACHIEVED", "LEVEL_UP", "STREAK_MILESTONE"
    );

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping
    public ResponseEntity<List<NotificationPreferenceDTO>> getAllPreferences(Authentication authentication) {
        Long userId = getUserId(authentication);
        
        List<NotificationPreference> existingPrefs = preferenceRepository.findByUserId(userId);
        
        List<NotificationPreferenceDTO> dtos = ALL_EVENT_TYPES.stream().map(eventType -> {
            NotificationPreference pref = existingPrefs.stream()
                .filter(p -> p.getEventType().equals(eventType))
                .findFirst()
                .orElse(NotificationPreference.builder()
                        .userId(userId)
                        .eventType(eventType)
                        .inAppEnabled(true)
                        .emailEnabled(false)
                        .build());
            return mapToDTO(pref);
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(dtos);
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PutMapping("/bulk")
    @Transactional
    public ResponseEntity<List<NotificationPreferenceDTO>> updateBulkPreferences(
            @RequestBody NotificationPreferenceBulkRequest request,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        
        List<NotificationPreferenceDTO> dtos = request.getPreferences().stream().map(dto -> {
            NotificationPreference pref = preferenceRepository.findByUserIdAndEventType(userId, dto.getEventType())
                    .orElse(NotificationPreference.builder()
                            .userId(userId)
                            .eventType(dto.getEventType())
                            .build());
            pref.setInAppEnabled(dto.getInAppEnabled() != null ? dto.getInAppEnabled() : pref.getInAppEnabled());
            pref.setEmailEnabled(dto.getEmailEnabled() != null ? dto.getEmailEnabled() : pref.getEmailEnabled());
            preferenceRepository.save(pref);
            return mapToDTO(pref);
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(dtos);
    }

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
