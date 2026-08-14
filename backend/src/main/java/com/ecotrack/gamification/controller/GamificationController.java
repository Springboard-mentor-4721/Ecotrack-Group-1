package com.ecotrack.gamification.controller;

import com.ecotrack.gamification.dto.BadgeDTO;
import com.ecotrack.gamification.dto.GamificationProfileDTO;
import com.ecotrack.gamification.dto.XpLedgerEntryDTO;
import com.ecotrack.gamification.entity.Badge;
import com.ecotrack.gamification.entity.UserBadge;
import com.ecotrack.gamification.entity.UserGamificationProfile;
import com.ecotrack.gamification.entity.XpLedger;
import com.ecotrack.gamification.repository.BadgeRepository;
import com.ecotrack.gamification.repository.UserBadgeRepository;
import com.ecotrack.gamification.repository.UserGamificationProfileRepository;
import com.ecotrack.gamification.repository.XpLedgerRepository;
import com.ecotrack.user.repository.UserRepository;
import com.ecotrack.gamification.config.GamificationConfigService;
import com.ecotrack.gamification.repository.BadgeProgressRepository;
import com.ecotrack.gamification.entity.BadgeProgress;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/gamification")
@RequiredArgsConstructor
public class GamificationController {

    private final UserGamificationProfileRepository profileRepository;
    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final XpLedgerRepository xpLedgerRepository;
    private final UserRepository userRepository;
    private final GamificationConfigService configService;
    private final BadgeProgressRepository badgeProgressRepository;
    private final com.ecotrack.gamification.engine.EcoScoreEngine ecoScoreEngine;

    @GetMapping("/profile")
    public ResponseEntity<GamificationProfileDTO> getProfile(Authentication authentication) {
        Long userId = getUserId(authentication);
        
        int totalBadges = (int) badgeRepository.count();
        int earnedBadges = userBadgeRepository.findByUserId(userId).size();
        
        return profileRepository.findByUserId(userId)
                .map(p -> {
                    long currentXp = p.getLifetimeEcoXp();
                    int nextLevel = p.getCurrentLevel() + 1;
                    String configKey = "LEVEL_" + nextLevel + "_THRESHOLD";
                    long nextLevelXpThreshold = 0;
                    long currentLevelBaseXp = 0;
                    try {
                        nextLevelXpThreshold = configService.getInt(configKey, p.getCurrentLevel() * 1000);
                        currentLevelBaseXp = configService.getInt("LEVEL_" + p.getCurrentLevel() + "_THRESHOLD", (p.getCurrentLevel() - 1) * 1000);
                    } catch (Exception e) {
                        nextLevelXpThreshold = p.getCurrentLevel() * 1000L;
                        currentLevelBaseXp = (p.getCurrentLevel() - 1) * 1000L;
                    }
                    
                    int effectiveStreak = p.getCurrentStreak() == null ? 0 : p.getCurrentStreak();
                    java.time.LocalDate today = java.time.LocalDate.now();
                    if (p.getLastActivityDate() != null && p.getLastActivityDate().isBefore(today.minusDays(1))) {
                        effectiveStreak = 0;
                    }
                    
                    return ResponseEntity.ok(GamificationProfileDTO.builder()
                        .userId(p.getUserId())
                        .currentEcoScore(p.getCurrentEcoScore())
                        .currentEcoGrade(ecoScoreEngine.calculateGrade(p.getCurrentEcoScore()))
                        .lifetimeEcoXp(p.getLifetimeEcoXp())
                        .currentLevel(p.getCurrentLevel())
                        .currentStreak(effectiveStreak)
                        .longestStreak(p.getLongestStreak())
                        .currentLevelBaseXp(currentLevelBaseXp)
                        .nextLevelXp(nextLevelXpThreshold)
                        .totalBadges(totalBadges)
                        .earnedBadges(earnedBadges)
                        .lastScoreUpdateAt(p.getLastScoreUpdateAt())
                        .build());
                })
                .orElseGet(() -> {
                    UserGamificationProfile newProfile = UserGamificationProfile.builder()
                            .userId(userId)
                            .currentEcoScore(java.math.BigDecimal.ZERO)
                            .lifetimeEcoXp(0L)
                            .currentLevel(1)
                            .currentStreak(0)
                            .longestStreak(0)
                            .build();
                    profileRepository.save(newProfile);
                    return ResponseEntity.ok(GamificationProfileDTO.builder()
                            .userId(userId)
                            .currentEcoScore(java.math.BigDecimal.ZERO)
                            .currentEcoGrade("C") // Score 0 -> C
                            .lifetimeEcoXp(0L)
                            .currentLevel(1)
                            .currentStreak(0)
                            .longestStreak(0)
                            .currentLevelBaseXp(0L)
                            .nextLevelXp(1000L)
                            .totalBadges(totalBadges)
                            .earnedBadges(earnedBadges)
                            .build());
                });
    }

    @GetMapping("/badges")
    public ResponseEntity<List<BadgeDTO>> getBadges(Authentication authentication) {
        Long userId = getUserId(authentication);
        
        List<Badge> allBadges = badgeRepository.findAll();
        List<UserBadge> userBadges = userBadgeRepository.findByUserId(userId);
        List<BadgeProgress> userProgress = badgeProgressRepository.findByUserId(userId);
        
        Map<Long, UserBadge> userBadgeMap = userBadges.stream()
                .collect(Collectors.toMap(ub -> ub.getBadge().getId(), ub -> ub));
                
        Map<Long, BadgeProgress> userProgressMap = userProgress.stream()
                .collect(Collectors.toMap(BadgeProgress::getBadgeId, bp -> bp));
                
        List<BadgeDTO> badgeDTOs = allBadges.stream()
                .filter(b -> !b.getIsHidden() || userBadgeMap.containsKey(b.getId()))
                .map(b -> {
                    UserBadge ub = userBadgeMap.get(b.getId());
                    BadgeProgress bp = userProgressMap.get(b.getId());
                    return BadgeDTO.builder()
                            .id(b.getId())
                            .name(b.getName())
                            .category(b.getCategory())
                            .description(b.getDescription())
                            .rarity(b.getRarity())
                            .type(b.getType())
                            .icon(b.getIcon())
                            .color(b.getColor())
                            .isEarned(ub != null)
                            .awardedAt(ub != null ? ub.getAwardedAt() : null)
                            .criteriaType(b.getCriteriaType())
                            .currentValue(bp != null ? bp.getCurrentValue() : 0)
                            .criteriaThreshold(b.getCriteriaThreshold())
                            .xpReward(b.getType() == com.ecotrack.gamification.enums.BadgeType.CHALLENGE ? 0 : com.ecotrack.gamification.enums.BadgeRarity.fromString(b.getRarity()).getXpReward())
                            .build();
                })
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(badgeDTOs);
    }

    @GetMapping("/xp-history")
    public ResponseEntity<org.springframework.data.domain.Page<XpLedgerEntryDTO>> getXpHistory(
            Authentication authentication,
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "0") int page,
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "10") int size) {
        Long userId = getUserId(authentication);
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        org.springframework.data.domain.Page<XpLedger> ledgerPage = xpLedgerRepository.findByUser_IdOrderByAwardedAtDesc(userId, pageable);
        
        org.springframework.data.domain.Page<XpLedgerEntryDTO> dtos = ledgerPage.map(x -> XpLedgerEntryDTO.builder()
                .id(x.getId())
                .userId(x.getUser().getId())
                .xpAwarded(x.getXpAwarded())
                .sourceType(x.getSourceType())
                .sourceId(x.getSourceId())
                .awardedAt(x.getAwardedAt())
                .build());
                
        return ResponseEntity.ok(dtos);
    }
    
    private Long getUserId(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found"))
                .getId();
    }
}
