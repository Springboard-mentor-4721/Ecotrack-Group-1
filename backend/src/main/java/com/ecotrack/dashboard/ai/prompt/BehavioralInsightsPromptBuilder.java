package com.ecotrack.dashboard.ai.prompt;

import com.ecotrack.ai.prompt.AbstractPromptBuilder;
import com.ecotrack.dashboard.ai.dto.BehavioralInsightsContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class BehavioralInsightsPromptBuilder extends AbstractPromptBuilder<BehavioralInsightsContext> {

    public BehavioralInsightsPromptBuilder(
            @Value("classpath:prompts/behavioral-insight-system.st") Resource systemResource,
            @Value("classpath:prompts/behavioral-insight-user.st") Resource userResource) {
        super(systemResource, userResource);
    }

    @Override
    protected Map<String, Object> toModel(BehavioralInsightsContext context) {
        return Map.of("longTermData", context.longTermData());
    }
}
