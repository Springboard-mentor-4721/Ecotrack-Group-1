package com.ecotrack.gamification.controller;

import com.ecotrack.gamification.config.GamificationConfigService;
import com.ecotrack.gamification.dto.GamificationConfigDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/gamification/config")
@RequiredArgsConstructor
public class AdminGamificationConfigController {

    private final GamificationConfigService configService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<GamificationConfigDTO>> getAllConfigs() {
        return ResponseEntity.ok(configService.getAllConfigs());
    }

    @PutMapping("/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GamificationConfigDTO> updateConfig(
            @PathVariable String key,
            @RequestBody Map<String, String> body) {
        
        String value = body.get("configValue");
        if (value == null) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            GamificationConfigDTO updated = configService.updateConfig(key, value);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
