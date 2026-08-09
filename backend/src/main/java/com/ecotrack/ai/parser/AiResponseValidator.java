package com.ecotrack.ai.parser;

import org.springframework.stereotype.Component;
import com.ecotrack.ai.exception.AiValidationException;
import com.ecotrack.dashboard.ai.dto.TrendPredictionResponse;
import com.ecotrack.tracking.ai.dto.SmartSuggestionResponse;
import com.ecotrack.dashboard.ai.dto.EcoTipResponse;
import com.ecotrack.tracking.ai.dto.JournalSummaryResponse;
import com.ecotrack.dashboard.ai.dto.BehavioralInsightsResponse;

@Component
public class AiResponseValidator {

    public void validate(TrendPredictionResponse r) {
        if (r == null) {
            throw new AiValidationException("Trend prediction response must not be null");
        }
        if (r.forecast() == null || r.forecast().size() != 7) {
            throw new AiValidationException("Trend prediction must contain exactly 7 forecast points, got: "
                    + (r.forecast() == null ? 0 : r.forecast().size()));
        }
        r.forecast().forEach(p -> {
            if (p.predictedCo2eKg() < 0) {
                throw new AiValidationException("Negative predicted emissions value is invalid");
            }
        });
        if (r.explanation() == null || r.explanation().isBlank()) {
            throw new AiValidationException("Explanation must not be blank");
        }
    }

    public void validate(SmartSuggestionResponse r) {
        if (r == null || r.suggestionText() == null || r.suggestionText().length() > 240) {
            throw new AiValidationException("Suggestion text missing or exceeds 240 characters");
        }
    }

    public void validate(EcoTipResponse r) {
        if (r == null || r.tipText() == null || r.tipText().isBlank() || r.tipText().length() > 160) {
            throw new AiValidationException("Tip text missing, blank, or exceeds 160 characters");
        }
    }

    public void validate(JournalSummaryResponse r) {
        if (r == null || r.summaryText() == null || r.summaryText().isBlank()) {
            throw new AiValidationException("Summary text missing or blank");
        }
        if (r.recommendations() == null || r.recommendations().isEmpty() || r.recommendations().size() > 3) {
            throw new AiValidationException("Recommendations must be 1 to 3 items");
        }
    }

    public void validate(BehavioralInsightsResponse r) {
        if (r == null) {
            throw new AiValidationException("Behavioral insights response must not be null");
        }
        if (r.insights() != null) {
            r.insights().forEach(i -> {
                if (i.patternText() == null || i.patternText().isBlank()) {
                    throw new AiValidationException("Insight pattern text must not be blank");
                }
            });
        }
    }
}
