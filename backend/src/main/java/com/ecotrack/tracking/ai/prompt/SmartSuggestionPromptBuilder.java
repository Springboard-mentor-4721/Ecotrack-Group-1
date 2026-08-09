package com.ecotrack.tracking.ai.prompt;

import com.ecotrack.ai.prompt.AbstractPromptBuilder;
import com.ecotrack.tracking.ai.dto.SmartSuggestionContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class SmartSuggestionPromptBuilder extends AbstractPromptBuilder<SmartSuggestionContext> {

    public SmartSuggestionPromptBuilder(
            @Value("classpath:prompts/smart-suggestion-system.st") Resource systemResource,
            @Value("classpath:prompts/smart-suggestion-user.st") Resource userResource) {
        super(systemResource, userResource);
    }

    @Override
    protected Map<String, Object> toModel(SmartSuggestionContext context) {
        return Map.of(
                "category", context.category(),
                "value", context.value(),
                "description", context.description() != null ? context.description() : "N/A"
        );
    }
}
