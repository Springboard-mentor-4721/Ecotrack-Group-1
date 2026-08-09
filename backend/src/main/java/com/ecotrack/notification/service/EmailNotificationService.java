package com.ecotrack.notification.service;

import com.ecotrack.notification.entity.NotificationPreference;
import com.ecotrack.notification.repository.NotificationPreferenceRepository;
import com.ecotrack.user.repository.UserRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailNotificationService {

    private final JavaMailSender javaMailSender;
    private final NotificationPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;
    private final TemplateEngine templateEngine;

    public void sendEmailIfEnabled(Long userId, String eventType, String subject, String text) {
        try {
            Optional<NotificationPreference> pref = preferenceRepository.findByUserIdAndEventType(userId, eventType);
            boolean emailEnabled = pref.map(NotificationPreference::getEmailEnabled).orElse(false);
            
            if (emailEnabled) {
                userRepository.findById(userId).ifPresent(user -> {
                    try {
                        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
                        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                        helper.setTo(user.getEmail());
                        helper.setSubject(subject);

                        Context context = new Context();
                        context.setVariable("message", text);
                        String name = user.getName() != null ? user.getName() : "User";
                        context.setVariable("userName", name);
                        
                        String templateName = getTemplateName(eventType);
                        String htmlContent = templateEngine.process(templateName, context);
                        
                        helper.setText(htmlContent, true);
                        javaMailSender.send(mimeMessage);
                        log.info("Sent email to user {} for event {}", userId, eventType);
                    } catch (Exception e) {
                        log.warn("Failed to send HTML email notification to user {} for event {}: {}", userId, eventType, e.getMessage());
                    }
                });
            }
        } catch (Exception e) {
            log.warn("Failed to check preference and send email for user {} and event {}: {}", userId, eventType, e.getMessage());
            // Best effort, do not throw exception.
        }
    }
    
    private String getTemplateName(String eventType) {
        if (eventType == null) return "default-notification";
        switch (eventType) {
            case "BADGE_EARNED":
                return "badge-unlocked";
            case "GOAL_ACHIEVED":
                return "goal-achieved";
            case "CHALLENGE_COMPLETED":
                return "challenge-completed";
            default:
                return "default-notification";
        }
    }
}
