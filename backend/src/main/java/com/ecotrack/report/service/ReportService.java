package com.ecotrack.report.service;

import com.ecotrack.challenge.entity.ChallengeParticipant;
import com.ecotrack.challenge.enums.ChallengeParticipantStatus;
import com.ecotrack.challenge.repository.ChallengeParticipantRepository;
import com.ecotrack.gamification.entity.UserGamificationProfile;
import com.ecotrack.gamification.repository.UserGamificationProfileRepository;
import com.ecotrack.goal.entity.Goal;
import com.ecotrack.goal.entity.enums.GoalStatus;
import com.ecotrack.goal.repository.GoalRepository;
import com.ecotrack.report.dto.CarbonReportDTO;
import com.ecotrack.report.dto.ChallengeReportDTO;
import com.ecotrack.report.dto.GoalReportDTO;
import com.ecotrack.report.dto.SustainabilityReportDTO;
import com.ecotrack.tracking.entity.CarbonEntry;
import com.ecotrack.tracking.repository.CarbonEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final CarbonEntryRepository carbonEntryRepository;
    private final GoalRepository goalRepository;
    private final ChallengeParticipantRepository challengeParticipantRepository;
    private final UserGamificationProfileRepository gamificationProfileRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public CarbonReportDTO getCarbonReport(Long userId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        List<CarbonEntry> entries = carbonEntryRepository.findAllWithCategoriesByUserIdAndDateRange(userId, start, end);

        BigDecimal totalEmissions = entries.stream()
                .map(CarbonEntry::getEmissionKgco2e)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, BigDecimal> emissionsByCategory = new HashMap<>();
        for (CarbonEntry entry : entries) {
            String category = entry.getSubCategory().getCategory().getName();
            emissionsByCategory.merge(category, entry.getEmissionKgco2e(), BigDecimal::add);
        }

        List<CarbonReportDTO.CarbonEntryDetail> details = entries.stream()
                .map(e -> CarbonReportDTO.CarbonEntryDetail.builder()
                        .date(e.getEntryDate().format(DATE_FORMATTER))
                        .category(e.getSubCategory().getCategory().getName())
                        .subCategory(e.getSubCategory().getName())
                        .emission(e.getEmissionKgco2e())
                        .description(e.getNotes() != null ? e.getNotes() : "")
                        .build())
                .collect(Collectors.toList());

        return CarbonReportDTO.builder()
                .startDate(startDate.format(DATE_FORMATTER))
                .endDate(endDate.format(DATE_FORMATTER))
                .totalEmissions(totalEmissions)
                .emissionsByCategory(emissionsByCategory)
                .entries(details)
                .build();
    }

    public GoalReportDTO getGoalReport(Long userId, LocalDate startDate, LocalDate endDate) {
        List<Goal> allGoals = goalRepository.findByUserId(userId, Pageable.unpaged()).getContent();

        List<Goal> filteredGoals = allGoals.stream()
                .filter(g -> {
                    LocalDate created = g.getCreatedAt().toLocalDate();
                    return (!created.isAfter(endDate) && !g.getTargetDate().isBefore(startDate));
                })
                .collect(Collectors.toList());

        int active = 0, completed = 0, failed = 0;
        List<GoalReportDTO.GoalDetail> details = filteredGoals.stream().map(g -> {
            BigDecimal currentValue = g.getProgressRecords().stream()
                    .map(com.ecotrack.goal.entity.GoalProgress::getProgressValue)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal progressPct = BigDecimal.ZERO;
            if (g.getTargetValue() != null && g.getTargetValue().compareTo(BigDecimal.ZERO) > 0) {
                progressPct = currentValue.divide(g.getTargetValue(), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            }
            return GoalReportDTO.GoalDetail.builder()
                    .title(g.getTitle())
                    .type(g.getGoalType().name())
                    .status(g.getStatus().name())
                    .targetValue(g.getTargetValue())
                    .currentValue(currentValue)
                    .unit(g.getUnit())
                    .targetDate(g.getTargetDate().format(DATE_FORMATTER))
                    .progressPercentage(progressPct)
                    .build();
        }).collect(Collectors.toList());

        for (Goal g : filteredGoals) {
            if (g.getStatus() == GoalStatus.ACTIVE) active++;
            else if (g.getStatus() == GoalStatus.ACHIEVED) completed++;
            else if (g.getStatus() == GoalStatus.EXPIRED || g.getStatus() == GoalStatus.ABANDONED) failed++;
        }

        return GoalReportDTO.builder()
                .startDate(startDate.format(DATE_FORMATTER))
                .endDate(endDate.format(DATE_FORMATTER))
                .totalGoals(filteredGoals.size())
                .activeGoals(active)
                .completedGoals(completed)
                .failedGoals(failed)
                .goals(details)
                .build();
    }

    public ChallengeReportDTO getChallengeReport(Long userId, LocalDate startDate, LocalDate endDate) {
        List<ChallengeParticipant> allParticipants = challengeParticipantRepository.findByUserId(userId, Pageable.unpaged()).getContent();

        List<ChallengeParticipant> filtered = allParticipants.stream()
                .filter(p -> {
                    LocalDate joined = p.getJoinedAt().toLocalDate();
                    return (!joined.isAfter(endDate) && (p.getCompletedAt() == null || !p.getCompletedAt().toLocalDate().isBefore(startDate)));
                })
                .collect(Collectors.toList());

        int completed = 0;
        long totalXp = 0;
        List<ChallengeReportDTO.ChallengeDetail> details = filtered.stream().map(p -> {
            BigDecimal progressPct = BigDecimal.ZERO;
            if (p.getChallenge().getTargetValue() != null && p.getChallenge().getTargetValue() > 0) {
                progressPct = p.getProgress().divide(BigDecimal.valueOf(p.getChallenge().getTargetValue()), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            }
            long xp = 0;
            if (p.getStatus() == ChallengeParticipantStatus.COMPLETED) {
                xp = p.getChallenge().getRewardXp();
            }
            return ChallengeReportDTO.ChallengeDetail.builder()
                    .title(p.getChallenge().getTitle())
                    .category(p.getChallenge().getChallengeEvaluationType().name())
                    .status(p.getStatus().name())
                    .progressPercentage(progressPct.doubleValue())
                    .xpEarned(xp)
                    .joinedDate(p.getJoinedAt().format(DATE_FORMATTER))
                    .completedDate(p.getCompletedAt() != null ? p.getCompletedAt().format(DATE_FORMATTER) : null)
                    .build();
        }).collect(Collectors.toList());

        for (ChallengeParticipant p : filtered) {
            if (p.getStatus() == ChallengeParticipantStatus.COMPLETED) {
                completed++;
                totalXp += p.getChallenge().getRewardXp();
            }
        }

        return ChallengeReportDTO.builder()
                .startDate(startDate.format(DATE_FORMATTER))
                .endDate(endDate.format(DATE_FORMATTER))
                .totalParticipated(filtered.size())
                .completedChallenges(completed)
                .totalXpEarned(totalXp)
                .challenges(details)
                .build();
    }

    public SustainabilityReportDTO getSustainabilityReport(Long userId, LocalDate startDate, LocalDate endDate) {
        CarbonReportDTO carbon = getCarbonReport(userId, startDate, endDate);
        GoalReportDTO goals = getGoalReport(userId, startDate, endDate);
        ChallengeReportDTO challenges = getChallengeReport(userId, startDate, endDate);

        UserGamificationProfile profile = gamificationProfileRepository.findByUserId(userId).orElse(null);

        return SustainabilityReportDTO.builder()
                .startDate(startDate.format(DATE_FORMATTER))
                .endDate(endDate.format(DATE_FORMATTER))
                .totalEmissions(carbon.getTotalEmissions())
                .totalGoals(goals.getTotalGoals())
                .completedGoals(goals.getCompletedGoals())
                .completedChallenges(challenges.getCompletedChallenges())
                .xpEarned(challenges.getTotalXpEarned())
                .currentEcoScore(profile != null && profile.getCurrentEcoScore() != null ? profile.getCurrentEcoScore().intValue() : 0)
                .currentRank(profile != null ? "Level " + profile.getCurrentLevel() : "NONE")
                .build();
    }
}
