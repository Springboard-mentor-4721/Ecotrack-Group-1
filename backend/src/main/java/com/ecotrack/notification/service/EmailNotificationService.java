package com.ecotrack.notification.service;

import com.ecotrack.notification.entity.NotificationPreference;
import com.ecotrack.notification.repository.NotificationPreferenceRepository;
import com.ecotrack.user.entity.User;
import com.ecotrack.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailNotificationService {

    private final JavaMailSender javaMailSender;
    private final NotificationPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;

    public void sendEmailIfEnabled(Long userId, String eventType, String subject, String text) {
        try {
            Optional<NotificationPreference> pref = preferenceRepository.findByUserIdAndEventType(userId, eventType);
            boolean emailEnabled = pref.map(NotificationPreference::getEmailEnabled).orElse(false);
            
            if (emailEnabled) {
                userRepository.findById(userId).ifPresent(user -> {
                    SimpleMailMessage message = new SimpleMailMessage();
                    message.setTo(user.getEmail());
                    message.setSubject(subject);
                    message.setText(text);
                    javaMailSender.send(message);
                    log.info("Sent email to user {} for event {}", userId, eventType);
                });
            }
        } catch (Exception e) {
            log.warn("Failed to send email notification to user {} for event {}: {}", userId, eventType, e.getMessage());
            // Best effort, do not throw exception.
        }
    }
}
