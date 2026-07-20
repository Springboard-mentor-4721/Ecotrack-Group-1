package com.ecotrack.security.interceptor;

import com.ecotrack.common.enums.Status;
import com.ecotrack.user.entity.User;
import com.ecotrack.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class SuspendedUserInterceptor implements HandlerInterceptor {

    private final UserRepository userRepository;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            String email = auth.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            
            if (user != null && user.getStatus() == Status.SUSPENDED) {
                response.setStatus(403);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"ACCOUNT_SUSPENDED\", \"message\": \"Your account has been suspended. Please contact your administrator.\"}");
                return false;
            }
        }
        return true;
    }
}
