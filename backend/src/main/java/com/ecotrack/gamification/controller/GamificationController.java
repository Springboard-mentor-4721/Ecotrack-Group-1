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

    @GetMapping("/profile")
    public ResponseEntity<GamificationProfileDTO> getProfile(Authentication authentication) {
        Long userId = getUserId(authentication);
        return profileRepository.findByUserId(userId)
                .map(p -> ResponseEntity.ok(GamificationProfileDTO.builder()
                        .userId(p.getUserId())
                        .currentEcoScore(p.getCurrentEcoScore())
                        .lifetimeEcoXp(p.getLifetimeEcoXp())
                        .currentLevel(p.getCurrentLevel())
                        .currentStreak(p.getCurrentStreak())
                        .lastScoreUpdateAt(p.getLastScoreUpdateAt())
                        .build()))
                .orElseGet(() -> {
                    UserGamificationProfile newProfile = UserGamificationProfile.builder()
                            .userId(userId)
                            .currentEcoScore(java.math.BigDecimal.ZERO)
                            .lifetimeEcoXp(0L)
                            .currentLevel(1)
                            .currentStreak(0)
                            .build();
                    profileRepository.save(newProfile);
                    return ResponseEntity.ok(GamificationProfileDTO.builder()
                            .userId(userId)
                            .currentEcoScore(java.math.BigDecimal.ZERO)
                            .lifetimeEcoXp(0L)
                            .currentLevel(1)
                            .currentStreak(0)
                            .build());
                });
    }

    @GetMapping("/badges")
    public ResponseEntity<List<BadgeDTO>> getBadges(Authentication authentication) {
        Long userId = getUserId(authentication);
        
        List<Badge> allBadges = badgeRepository.findAll();
        List<UserBadge> userBadges = userBadgeRepository.findByUserId(userId);
        
        Map<Long, UserBadge> userBadgeMap = userBadges.stream()
                .collect(Collectors.toMap(ub -> ub.getBadge().getId(), ub -> ub));
                
        List<BadgeDTO> badgeDTOs = allBadges.stream()
                .filter(b -> !b.getIsHidden() || userBadgeMap.containsKey(b.getId()))
                .map(b -> {
                    UserBadge ub = userBadgeMap.get(b.getId());
                    return BadgeDTO.builder()
                            .id(b.getId())
                            .name(b.getName())
                            .category(b.getCategory())
                            .description(b.getDescription())
                            .rarity(b.getRarity())
                            .isEarned(ub != null)
                            .awardedAt(ub != null ? ub.getAwardedAt() : null)
                            .build();
                })
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(badgeDTOs);
    }

    @GetMapping("/xp-history")
    public ResponseEntity<List<XpLedgerEntryDTO>> getXpHistory(Authentication authentication) {
        Long userId = getUserId(authentication);
        List<XpLedger> ledgerEntries = xpLedgerRepository.findAll();
        List<XpLedgerEntryDTO> dtos = ledgerEntries.stream()
                .filter(x -> x.getUser().getId().equals(userId))
                .map(x -> XpLedgerEntryDTO.builder()
                        .id(x.getId())
                        .userId(x.getUser().getId())
                        .xpAwarded(x.getXpAwarded())
                        .sourceType(x.getSourceType())
                        .sourceId(x.getSourceId())
                        .awardedAt(x.getAwardedAt())
                        .build())
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(dtos);
    }
    
    private Long getUserId(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found"))
                .getId();
    }
}
