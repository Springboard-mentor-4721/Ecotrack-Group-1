package com.ecotrack.gamification.service;

import com.ecotrack.gamification.entity.UserGamificationProfile;
import com.ecotrack.gamification.repository.UserGamificationProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.transaction.annotation.Propagation;

import com.ecotrack.event.XPGrantedEvent;
import com.ecotrack.event.LevelUpEvent;

@Slf4j
@Service
@RequiredArgsConstructor
public class GamificationProfileService {

    private final UserGamificationProfileRepository profileRepository;
    private final LevelService levelService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public void createProfileForNewUser(Long userId) {
        log.info("Creating gamification profile for user: {}", userId);
        
        UserGamificationProfile profile = UserGamificationProfile.builder()
                .userId(userId)
                .build();
                
        profileRepository.save(profile);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleXPGranted(XPGrantedEvent event) {
        profileRepository.findByUserId(event.getUserId()).ifPresent(profile -> {
            profile.setLifetimeEcoXp(event.getTotalXp());
            
            Integer oldLevel = profile.getCurrentLevel();
            if (oldLevel == null) oldLevel = 1;
            
            int newLevel = levelService.calculateLevel(event.getTotalXp());
            
            if (newLevel > oldLevel) {
                profile.setCurrentLevel(newLevel);
                eventPublisher.publishEvent(new LevelUpEvent(event.getUserId(), oldLevel, newLevel));
                log.info("User {} leveled up to {}", event.getUserId(), newLevel);
            }
            
            profileRepository.save(profile);
        });
    }
}
