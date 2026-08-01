package com.ecotrack.challenge.entity;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class ChallengeRulesConverter implements AttributeConverter<ChallengeRules, String> {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(ChallengeRules attribute) {
        if (attribute == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Error converting ChallengeRules to JSON", e);
        }
    }

    @Override
    public ChallengeRules convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return null;
        }
        try {
            return objectMapper.readValue(dbData, ChallengeRules.class);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Error converting JSON to ChallengeRules", e);
        }
    }
}
