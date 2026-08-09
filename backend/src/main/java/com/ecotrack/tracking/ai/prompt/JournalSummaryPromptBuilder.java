package com.ecotrack.tracking.ai.prompt;

import com.ecotrack.ai.prompt.AbstractPromptBuilder;
import com.ecotrack.tracking.ai.dto.JournalSummaryContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class JournalSummaryPromptBuilder extends AbstractPromptBuilder<JournalSummaryContext> {

    public JournalSummaryPromptBuilder(
            @Value("classpath:prompts/journal-summary-system.st") Resource systemResource,
            @Value("classpath:prompts/journal-summary-user.st") Resource userResource) {
        super(systemResource, userResource);
    }

    @Override
    protected Map<String, Object> toModel(JournalSummaryContext context) {
        return Map.of(
                "timeframe", context.timeframe(),
                "journalData", context.journalData()
        );
    }
}
