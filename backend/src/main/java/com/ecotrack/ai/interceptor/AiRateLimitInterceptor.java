package com.ecotrack.ai.interceptor;

import com.ecotrack.ai.config.EcoTrackAiProperties;
import com.ecotrack.user.entity.User;
import com.ecotrack.user.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

// @Component removed to allow manual bean definition in AiConfig
public class AiRateLimitInterceptor implements HandlerInterceptor {

    private final EcoTrackAiProperties aiProperties;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final ConcurrentHashMap<Long, List<LocalDateTime>> userRequests = new ConcurrentHashMap<>();

    public AiRateLimitInterceptor(EcoTrackAiProperties aiProperties, UserRepository userRepository, ObjectMapper objectMapper) {
        this.aiProperties = aiProperties;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (!aiProperties.manualRateLimit().enabled()) {
            return true;
        }

        if (!request.getMethod().equalsIgnoreCase("POST")) {
            return true;
        }

        String uri = request.getRequestURI();
        if (uri.contains("/insights/generate") && !aiProperties.features().insightsEnabled()) {
            return true;
        }
        if (uri.contains("/journal-summary") && !aiProperties.features().journalSummaryEnabled()) {
            return true;
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return true; // Let Spring Security handle unauthenticated
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return true;
        }

        Long userId = user.getId();
        LocalDateTime now = LocalDateTime.now();
        int limit = aiProperties.manualRateLimit().requestsPerMinute();

        List<LocalDateTime> requests = userRequests.computeIfAbsent(userId, k -> new ArrayList<>());

        synchronized (requests) {
            // Remove requests older than 60 seconds
            requests.removeIf(time -> ChronoUnit.SECONDS.between(time, now) >= 60);

            if (requests.size() >= limit) {
                LocalDateTime oldest = requests.get(0);
                long secondsPassed = ChronoUnit.SECONDS.between(oldest, now);
                long retryAfter = Math.max(1, 60 - secondsPassed);

                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                
                Map<String, Object> errorBody = Map.of(
                        "message", "AI request limit reached. Please try again later.",
                        "retryAfterSeconds", retryAfter
                );
                response.getWriter().write(objectMapper.writeValueAsString(errorBody));
                
                return false;
            }

            requests.add(now);
        }

        return true;
    }
}
