package com.ecotrack.tracking.ai.listener;

import com.ecotrack.event.CarbonEntryCreatedEvent;
import com.ecotrack.tracking.ai.dto.SmartSuggestionContext;
import com.ecotrack.tracking.ai.service.SmartSuggestionService;
import com.ecotrack.tracking.entity.CarbonCategory;
import com.ecotrack.tracking.repository.CarbonCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class CarbonEntryAiEventListener {

    private final SmartSuggestionService trackingAiService;
    private final CarbonCategoryRepository categoryRepository;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleCarbonEntryCreated(CarbonEntryCreatedEvent event) {
        String categoryName = categoryRepository.findById(event.getCategoryId())
                .map(CarbonCategory::getName)
                .orElse("Unknown");
        
        SmartSuggestionContext context = new SmartSuggestionContext(
                categoryName,
                event.getAmount() != null ? event.getAmount().doubleValue() : 0.0,
                "Carbon entry logged"
        );
        trackingAiService.generateSmartSuggestionAsync(event.getUserId(), event.getEntryId(), context);
    }
}
