package com.ecotrack.ai.history;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.ecotrack.user.entity.User;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai/history")
public class AiHistoryController {

    private final AiGenerationHistoryRepository historyRepository;
    private final com.ecotrack.user.repository.UserRepository userRepository;

    public AiHistoryController(AiGenerationHistoryRepository historyRepository, com.ecotrack.user.repository.UserRepository userRepository) {
        this.historyRepository = historyRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getHistory(
            org.springframework.security.core.Authentication authentication,
            @RequestParam(required = false) AiGenerationHistory.ContentType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Long userId = getUserId(authentication);
        
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "generatedAt", "id"));
        Page<AiGenerationHistory> historyPage;
        
        if (type != null) {
            historyPage = historyRepository.findByUserIdAndContentType(userId, type, pageRequest);
        } else {
            historyPage = historyRepository.findByUserId(userId, pageRequest);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("items", historyPage.getContent());
        response.put("currentPage", historyPage.getNumber());
        response.put("totalItems", historyPage.getTotalElements());
        response.put("totalPages", historyPage.getTotalPages());

        return ResponseEntity.ok(response);
    }
    
    private Long getUserId(org.springframework.security.core.Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found"))
                .getId();
    }
}
