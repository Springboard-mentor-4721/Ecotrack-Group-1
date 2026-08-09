package com.ecotrack.dashboard.ai.prompt;

import com.ecotrack.ai.prompt.AbstractPromptBuilder;
import com.ecotrack.dashboard.ai.dto.EcoTipContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class EcoTipPromptBuilder extends AbstractPromptBuilder<EcoTipContext> {

    public EcoTipPromptBuilder(
            @Value("classpath:prompts/daily-tip-system.st") Resource systemResource,
            @Value("classpath:prompts/daily-tip-user.st") Resource userResource) {
        super(systemResource, userResource);
    }

    @Override
    protected Map<String, Object> toModel(EcoTipContext context) {
        return Map.of("recentCategories", context.recentCategories() != null ? context.recentCategories() : "N/A");
    }
}
