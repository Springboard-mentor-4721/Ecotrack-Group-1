package com.ecotrack.recommendation.service;

import com.ecotrack.goal.entity.Goal;
import com.ecotrack.goal.entity.enums.GoalStatus;
import com.ecotrack.goal.repository.GoalRepository;
import com.ecotrack.recommendation.dto.EligibleTargetDTO;
import com.ecotrack.recommendation.dto.UserContextDTO;
import com.ecotrack.tracking.repository.CarbonEntryRepository;
import com.ecotrack.tracking.repository.projection.SubCategoryVolumeProjection;
import com.ecotrack.user.entity.UserProfile;
import com.ecotrack.user.repository.UserProfileRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class ContextAssemblyService {

    private final CarbonEntryRepository carbonEntryRepository;
    private final GoalRepository goalRepository;
    private final UserProfileRepository userProfileRepository;

    public ContextAssemblyService(CarbonEntryRepository carbonEntryRepository, GoalRepository goalRepository, UserProfileRepository userProfileRepository) {
        this.carbonEntryRepository = carbonEntryRepository;
        this.goalRepository = goalRepository;
        this.userProfileRepository = userProfileRepository;
    }

    public UserContextDTO assembleContext(Long userId, List<String> previousRecommendations) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        List<Goal> activeGoals = goalRepository.findByUserIdAndStatus(userId, GoalStatus.ACTIVE, PageRequest.of(0, 5)).getContent();
        List<SubCategoryVolumeProjection> topByVolume = carbonEntryRepository.getTopSubCategoriesByVolume(userId, thirtyDaysAgo, PageRequest.of(0, 2));
        List<SubCategoryVolumeProjection> topByFreq = carbonEntryRepository.getTopSubCategoriesByFrequency(userId, thirtyDaysAgo, PageRequest.of(0, 2));

        List<EligibleTargetDTO> eligibleTargets = new ArrayList<>();
        Set<String> seenTargets = new HashSet<>();

        // Priority 1: Goals
        for (Goal goal : activeGoals) {
            String targetCategory = mapGoalToCategory(goal.getGoalType().name());
            if (targetCategory != null) {
                // Find if user has any activity in this category in top volume/freq to find subcategory
                String subCat = findSubCategoryForCategory(targetCategory, topByVolume, topByFreq);
                if (subCat != null && seenTargets.add(targetCategory + "/" + subCat)) {
                    eligibleTargets.add(new EligibleTargetDTO(targetCategory, subCat, "Aligns with active goal: '" + goal.getTitle() + "'"));
                }
            }
        }

        // Priority 2: Volume
        for (SubCategoryVolumeProjection vol : topByVolume) {
            if (seenTargets.add(vol.getCategoryCode() + "/" + vol.getSubCategoryName())) {
                eligibleTargets.add(new EligibleTargetDTO(vol.getCategoryCode(), vol.getSubCategoryName(), "Highest emission source over last 30 days."));
            }
        }

        // Priority 3: Frequency
        for (SubCategoryVolumeProjection freq : topByFreq) {
            if (seenTargets.add(freq.getCategoryCode() + "/" + freq.getSubCategoryName())) {
                eligibleTargets.add(new EligibleTargetDTO(freq.getCategoryCode(), freq.getSubCategoryName(), "Most frequent activity over last 30 days."));
            }
        }
        
        List<String> lifestyleConstraints = new ArrayList<>();
        userProfileRepository.findByUser_Id(userId).ifPresent(profile -> {
            if (profile.getLifestylePreferences() != null && !profile.getLifestylePreferences().isBlank()) {
                lifestyleConstraints.add(profile.getLifestylePreferences());
            }
        });

        return UserContextDTO.builder()
                .userId(userId)
                .eligibleTargets(eligibleTargets)
                .lifestyleConstraints(lifestyleConstraints)
                .previousRecommendations(previousRecommendations)
                .build();
    }

    private String mapGoalToCategory(String goalType) {
        return switch (goalType) {
            case "REDUCE_WATER_USAGE" -> "WATER";
            case "REDUCE_ELECTRICITY_CONSUMPTION" -> "ELECTRICITY";
            case "USE_PUBLIC_TRANSPORT" -> "TRANSPORTATION";
            case "INCREASE_RECYCLING", "REDUCE_PLASTIC_USAGE" -> "WASTE";
            default -> null;
        };
    }

    private String findSubCategoryForCategory(String categoryCode, List<SubCategoryVolumeProjection> topByVolume, List<SubCategoryVolumeProjection> topByFreq) {
        for (SubCategoryVolumeProjection vol : topByVolume) {
            if (categoryCode.equals(vol.getCategoryCode())) return vol.getSubCategoryName();
        }
        for (SubCategoryVolumeProjection freq : topByFreq) {
            if (categoryCode.equals(freq.getCategoryCode())) return freq.getSubCategoryName();
        }
        return null;
    }
}

