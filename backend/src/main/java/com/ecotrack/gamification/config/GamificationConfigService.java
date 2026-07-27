package com.ecotrack.gamification.config;

import com.ecotrack.gamification.entity.GamificationConfig;
import com.ecotrack.gamification.repository.GamificationConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class GamificationConfigService {

    private final GamificationConfigRepository repository;

    @Cacheable(value = "gamificationConfig", key = "#key")
    public String getString(String key, String defaultValue) {
        return repository.findById(key)
                .map(GamificationConfig::getConfigValue)
                .orElse(defaultValue);
    }

    @Cacheable(value = "gamificationConfig", key = "#key")
    public int getInt(String key, int defaultValue) {
        return repository.findById(key)
                .map(config -> Integer.parseInt(config.getConfigValue()))
                .orElse(defaultValue);
    }

    @Cacheable(value = "gamificationConfig", key = "#key")
    public BigDecimal getDecimal(String key, BigDecimal defaultValue) {
        return repository.findById(key)
                .map(config -> new BigDecimal(config.getConfigValue()))
                .orElse(defaultValue);
    }
}
