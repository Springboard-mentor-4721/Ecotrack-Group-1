package com.ecotrack.challenge.entity;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class RulesConfigConverter implements AttributeConverter<RulesConfig, String> {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(RulesConfig attribute) {
        if (attribute == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Error converting RulesConfig to JSON", e);
        }
    }

    @Override
    public RulesConfig convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return null;
        }
        try {
            return objectMapper.readValue(dbData, RulesConfig.class);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Error converting JSON to RulesConfig", e);
        }
    }
}
