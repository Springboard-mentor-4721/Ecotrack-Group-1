package com.ecotrack.dashboard.ai.prompt;

import com.ecotrack.ai.prompt.AbstractPromptBuilder;
import com.ecotrack.dashboard.ai.dto.TrendPredictionContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class TrendPredictionPromptBuilder extends AbstractPromptBuilder<TrendPredictionContext> {

    public TrendPredictionPromptBuilder(
            @Value("classpath:prompts/trend-prediction-system.st") Resource systemResource,
            @Value("classpath:prompts/trend-prediction-user.st") Resource userResource) {
        super(systemResource, userResource);
    }

    @Override
    protected Map<String, Object> toModel(TrendPredictionContext context) {
        return Map.of(
                "historicalData", context.historicalData(),
                "startDate", context.startDate()
        );
    }
}
