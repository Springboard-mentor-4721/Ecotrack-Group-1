package com.ecotrack.gamification.service;

import com.ecotrack.gamification.config.GamificationConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class LevelService {

    private final GamificationConfigService configService;

    public int calculateLevel(Long totalXp) {
        if (totalXp == null || totalXp < 0) {
            return 1;
        }

        int level5 = configService.getInt("LEVEL_5_THRESHOLD", 50000);
        int level4 = configService.getInt("LEVEL_4_THRESHOLD", 15000);
        int level3 = configService.getInt("LEVEL_3_THRESHOLD", 5000);
        int level2 = configService.getInt("LEVEL_2_THRESHOLD", 1000);

        if (totalXp >= level5) return 5;
        if (totalXp >= level4) return 4;
        if (totalXp >= level3) return 3;
        if (totalXp >= level2) return 2;
        
        return 1;
    }
}
