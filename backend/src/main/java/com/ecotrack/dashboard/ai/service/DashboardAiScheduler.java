package com.ecotrack.dashboard.ai.service;

import com.ecotrack.user.entity.User;
import com.ecotrack.user.repository.UserRepository;
import com.ecotrack.tracking.service.CarbonEntryService;
import com.ecotrack.dashboard.ai.dto.EcoTipContext;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DashboardAiScheduler {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(DashboardAiScheduler.class);

    private final DailyEcoTipService dailyEcoTipService;
    private final UserRepository userRepository;
    private final CarbonEntryService carbonEntryService;

    public DashboardAiScheduler(DailyEcoTipService dailyEcoTipService,
                                UserRepository userRepository,
                                CarbonEntryService carbonEntryService) {
        this.dailyEcoTipService = dailyEcoTipService;
        this.userRepository = userRepository;
        this.carbonEntryService = carbonEntryService;
    }

    @Scheduled(cron = "0 0 5 * * *") // Daily at 05:00
    public void generateDailyInsights() {
        log.info("Starting scheduled daily AI tip generation");
        List<User> users = userRepository.findAll();
        for (User user : users) {
            processDailyForUserAsync(user.getId());
            try {
                Thread.sleep(8000); // Respect 15 RPM limit for Eco Tips
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }

    @Async("aiTaskExecutor")
    public void processDailyForUserAsync(Long userId) {
        try {
            String recentCategories = carbonEntryService.getRawJournalDataStringForUser(userId, "weekly");
            EcoTipContext tipContext = new EcoTipContext(recentCategories);
            dailyEcoTipService.scheduledGenerate(userId, tipContext);
        } catch (Exception e) {
            log.warn("Scheduled daily generation failed for user {}: {}", userId, e.getMessage());
        }
    }
}
