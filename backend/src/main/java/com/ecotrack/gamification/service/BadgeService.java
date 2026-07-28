package com.ecotrack.gamification.service;

import com.ecotrack.gamification.dto.AdminBadgeDTO;
import com.ecotrack.gamification.dto.BadgeDefinitionRequest;
import com.ecotrack.gamification.entity.Badge;
import com.ecotrack.gamification.repository.BadgeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class BadgeService {

    private final BadgeRepository badgeRepository;

    private static final Set<String> VALID_CRITERIA_TYPES = Set.of(
            "CARBON_ENTRIES_COUNT",
            "CATEGORY_SPECIALIST",
            "GOAL_COMPLETED_COUNT",
            "STREAK_DAYS"
    );

    private static final Set<String> VALID_RARITIES = Set.of(
            "COMMON",
            "RARE",
            "EPIC",
            "LEGENDARY"
    );

    @Transactional
    public AdminBadgeDTO createBadge(BadgeDefinitionRequest request) {
        validateBadgeRequest(request);

        Badge badge = Badge.builder()
                .name(request.getName())
                .category(request.getCategory())
                .description(request.getDescription())
                .rarity(request.getRarity())
                .isHidden(request.getIsHidden())
                .isRepeatable(request.getIsRepeatable())
                .criteriaType(request.getCriteriaType())
                .criteriaThreshold(request.getCriteriaThreshold())
                .build();
                
        return mapToAdminDTO(badgeRepository.save(badge));
    }

    @Transactional
    public AdminBadgeDTO updateBadge(Long id, BadgeDefinitionRequest request) {
        validateBadgeRequest(request);

        Badge badge = badgeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Badge not found with ID: " + id));
                
        badge.setName(request.getName());
        badge.setCategory(request.getCategory());
        badge.setDescription(request.getDescription());
        badge.setRarity(request.getRarity());
        badge.setIsHidden(request.getIsHidden());
        badge.setIsRepeatable(request.getIsRepeatable());
        badge.setCriteriaType(request.getCriteriaType());
        badge.setCriteriaThreshold(request.getCriteriaThreshold());
        
        return mapToAdminDTO(badgeRepository.save(badge));
    }

    private void validateBadgeRequest(BadgeDefinitionRequest request) {
        if (!VALID_CRITERIA_TYPES.contains(request.getCriteriaType())) {
            throw new IllegalArgumentException("Unsupported criteriaType: " + request.getCriteriaType());
        }
        if (!VALID_RARITIES.contains(request.getRarity())) {
            throw new IllegalArgumentException("Unsupported rarity: " + request.getRarity());
        }
    }

    @Transactional
    public void disableBadge(Long id) {
        Badge badge = badgeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Badge not found with ID: " + id));
        badge.setIsHidden(true);
        badgeRepository.save(badge);
    }

    @Transactional(readOnly = true)
    public Page<AdminBadgeDTO> getAllBadges(Pageable pageable) {
        return badgeRepository.findAll(pageable).map(this::mapToAdminDTO);
    }

    private AdminBadgeDTO mapToAdminDTO(Badge badge) {
        return AdminBadgeDTO.builder()
                .id(badge.getId())
                .name(badge.getName())
                .category(badge.getCategory())
                .description(badge.getDescription())
                .rarity(badge.getRarity())
                .isHidden(badge.getIsHidden())
                .isRepeatable(badge.getIsRepeatable())
                .criteriaType(badge.getCriteriaType())
                .criteriaThreshold(badge.getCriteriaThreshold())
                .createdAt(badge.getCreatedAt())
                .build();
    }
}
