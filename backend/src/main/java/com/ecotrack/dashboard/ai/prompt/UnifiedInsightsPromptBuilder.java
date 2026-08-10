package com.ecotrack.dashboard.ai.prompt;

import com.ecotrack.dashboard.ai.dto.UnifiedInsightsContext;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.SystemPromptTemplate;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class UnifiedInsightsPromptBuilder {

    @Value("classpath:prompts/unified-insights-system.st")
    private Resource systemTemplateResource;

    @Value("classpath:prompts/unified-insights-user.st")
    private Resource userTemplateResource;

    public Prompt build(UnifiedInsightsContext context) {
        SystemPromptTemplate systemPromptTemplate = new SystemPromptTemplate(systemTemplateResource);
        Message systemMessage = systemPromptTemplate.createMessage();

        SystemPromptTemplate userPromptTemplate = new SystemPromptTemplate(userTemplateResource);
        Message userMessage = userPromptTemplate.createMessage(Map.of(
                "currentEmission", context.currentEmission(),
                "previousEmission", context.previousEmission(),
                "percentageChange", context.percentageChange(),
                "trendDirection", context.trendDirection(),
                "dominantCategory", context.dominantCategory(),
                "concerningPatterns", String.join(", ", context.concerningPatterns()),
                "positivePatterns", String.join(", ", context.positivePatterns()),
                "rawJournalData", context.rawJournalData() != null ? context.rawJournalData() : "No recent entries"
        ));

        return new Prompt(List.of(systemMessage, userMessage));
    }
}
