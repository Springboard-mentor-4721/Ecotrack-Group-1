package com.ecotrack.gamification.controller;

import com.ecotrack.gamification.config.GamificationConfigService;
import com.ecotrack.gamification.dto.ConfigUpdateRequest;
import com.ecotrack.gamification.dto.GamificationConfigDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/config")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminConfigController {

    private final GamificationConfigService configService;

    @GetMapping
    public ResponseEntity<List<GamificationConfigDTO>> getAllConfigs() {
        return ResponseEntity.ok(configService.getAllConfigs());
    }

    @PutMapping("/{key}")
    public ResponseEntity<GamificationConfigDTO> updateConfig(
            @PathVariable String key,
            @Valid @RequestBody ConfigUpdateRequest request) {
        return ResponseEntity.ok(configService.updateConfig(key, request.getValue()));
    }
}
