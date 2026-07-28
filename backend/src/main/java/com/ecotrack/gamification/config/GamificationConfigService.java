package com.ecotrack.gamification.config;

import com.ecotrack.gamification.dto.GamificationConfigDTO;
import com.ecotrack.gamification.entity.GamificationConfig;
import com.ecotrack.gamification.repository.GamificationConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

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

    @Transactional(readOnly = true)
    public List<GamificationConfigDTO> getAllConfigs() {
        return repository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "gamificationConfig", key = "#key")
    public GamificationConfigDTO updateConfig(String key, String value) {
        GamificationConfig config = repository.findById(key)
                .orElseThrow(() -> new IllegalArgumentException("Config not found with key: " + key));

        validateConfigValue(value, config.getValueType());

        config.setConfigValue(value);
        return mapToDTO(repository.save(config));
    }

    private void validateConfigValue(String value, String type) {
        try {
            switch (type.toUpperCase()) {
                case "INT":
                    Integer.parseInt(value);
                    break;
                case "DECIMAL":
                    new BigDecimal(value);
                    break;
                default:
                    throw new IllegalArgumentException("Unknown value type: " + type);
            }
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid format for value type " + type + ": " + value);
        }
    }

    private GamificationConfigDTO mapToDTO(GamificationConfig config) {
        return GamificationConfigDTO.builder()
                .configKey(config.getConfigKey())
                .configValue(config.getConfigValue())
                .valueType(config.getValueType())
                .description(config.getDescription())
                .updatedAt(config.getUpdatedAt())
                .build();
    }
}
