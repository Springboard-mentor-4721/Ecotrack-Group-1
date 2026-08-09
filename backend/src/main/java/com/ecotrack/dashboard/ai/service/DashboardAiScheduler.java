package com.ecotrack.dashboard.ai.service;

import com.ecotrack.user.entity.User;
import com.ecotrack.user.repository.UserRepository;
import com.ecotrack.tracking.service.CarbonEntryService;
import com.ecotrack.dashboard.ai.dto.EcoTipContext;
import com.ecotrack.dashboard.ai.dto.TrendPredictionContext;
import com.ecotrack.dashboard.ai.dto.BehavioralInsightsContext;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.List;
import java.time.LocalDate;

@Component
public class DashboardAiScheduler {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(DashboardAiScheduler.class);

    private final DailyEcoTipService dailyEcoTipService;
    private final TrendPredictionService trendPredictionService;
    private final BehavioralInsightService behavioralInsightService;
    private final UserRepository userRepository;
    private final CarbonEntryService carbonEntryService;

    public DashboardAiScheduler(DailyEcoTipService dailyEcoTipService,
                                TrendPredictionService trendPredictionService,
                                BehavioralInsightService behavioralInsightService,
                                UserRepository userRepository,
                                CarbonEntryService carbonEntryService) {
        this.dailyEcoTipService = dailyEcoTipService;
        this.trendPredictionService = trendPredictionService;
        this.behavioralInsightService = behavioralInsightService;
        this.userRepository = userRepository;
        this.carbonEntryService = carbonEntryService;
    }

    @Scheduled(cron = "0 0 5 * * *") // Daily at 05:00
    public void generateDailyInsights() {
        log.info("Starting scheduled daily AI insights generation");
        List<User> users = userRepository.findAll();
        for (User user : users) {
            processDailyForUserAsync(user.getId());
        }
    }
    
    @Scheduled(cron = "0 0 4 * * SUN") // Weekly Sunday at 04:00
    public void generateWeeklyInsights() {
        log.info("Starting scheduled weekly AI behavioral insights generation");
        List<User> users = userRepository.findAll();
        for (User user : users) {
            processWeeklyForUserAsync(user.getId());
        }
    }

    @Async("aiTaskExecutor")
    public void processDailyForUserAsync(Long userId) {
        try {
            String recentCategories = carbonEntryService.getRawJournalDataStringForUser(userId, "weekly");
            EcoTipContext tipContext = new EcoTipContext(recentCategories);
            dailyEcoTipService.scheduledGenerate(userId, tipContext);
            
            String historicalData = carbonEntryService.getRawJournalDataStringForUser(userId, "monthly");
            TrendPredictionContext trendContext = new TrendPredictionContext(historicalData, LocalDate.now().toString());
            trendPredictionService.scheduledGenerate(userId, trendContext);
        } catch (Exception e) {
            log.warn("Scheduled daily generation failed for user {}: {}", userId, e.getMessage());
        }
    }

    @Async("aiTaskExecutor")
    public void processWeeklyForUserAsync(Long userId) {
        try {
            String longTermData = carbonEntryService.getRawJournalDataStringForUser(userId, "monthly");
            BehavioralInsightsContext context = new BehavioralInsightsContext(longTermData);
            behavioralInsightService.scheduledGenerate(userId, context);
        } catch (Exception e) {
            log.warn("Scheduled weekly generation failed for user {}: {}", userId, e.getMessage());
        }
    }
}
