package com.ecotrack.challenge.service;

import com.ecotrack.challenge.dto.ChallengeDTO;
import com.ecotrack.challenge.dto.ChallengeDetailDTO;
import com.ecotrack.challenge.dto.ChallengeParticipantDTO;
import com.ecotrack.challenge.dto.ChallengeRequest;
import com.ecotrack.challenge.dto.ChallengeStatsDTO;
import com.ecotrack.challenge.dto.ChallengeAnalyticsDTO;
import com.ecotrack.challenge.dto.BulkModerateRequest;
import com.ecotrack.challenge.dto.BulkArchiveRequest;
import com.ecotrack.challenge.dto.BulkActionResult;
import com.ecotrack.challenge.entity.Challenge;
import com.ecotrack.challenge.entity.ChallengeParticipant;
import com.ecotrack.challenge.enums.ChallengeParticipantStatus;
import com.ecotrack.challenge.enums.ChallengeStatus;
import com.ecotrack.challenge.enums.TrackingMethod;
import com.ecotrack.challenge.exception.ChallengeAlreadyJoinedException;
import com.ecotrack.challenge.exception.ChallengeClosedException;
import com.ecotrack.challenge.repository.ChallengeParticipantRepository;
import com.ecotrack.challenge.repository.ChallengeRepository;
import com.ecotrack.challenge.repository.ChallengeSpecification;
import com.ecotrack.tracking.repository.CarbonCategoryRepository;
import com.ecotrack.user.repository.UserRepository;
import com.ecotrack.user.util.FileUploadUtil;
import com.ecotrack.gamification.repository.BadgeRepository;
import com.ecotrack.gamification.entity.Badge;
import com.ecotrack.gamification.dto.AdminBadgeDTO;
import com.ecotrack.gamification.enums.BadgeType;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import org.springframework.context.ApplicationEventPublisher;
import com.ecotrack.event.ChallengeCompletedEvent;
import com.ecotrack.challenge.strategy.StrategyResolver;
import com.ecotrack.challenge.strategy.ChallengeEvaluationStrategy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChallengeService {

    private final ChallengeRepository challengeRepository;
    private final ChallengeParticipantRepository participantRepository;
    private final UserRepository userRepository;
    private final CarbonCategoryRepository carbonCategoryRepository;
    private final com.ecotrack.tracking.repository.CarbonSubCategoryRepository carbonSubCategoryRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final StrategyResolver strategyResolver;
    private final BadgeRepository badgeRepository;

    @Transactional(readOnly = true)
    public Page<ChallengeDTO> getActiveChallenges(Long userId, String search, com.ecotrack.challenge.enums.ChallengeEvaluationType evaluationType, TrackingMethod trackingMethod, Pageable pageable) {
        Page<Challenge> page = challengeRepository.findAll(ChallengeSpecification.exploreFilter(search, evaluationType, trackingMethod, userId), pageable);
        return mapToDTOPage(page);
    }

    @Transactional(readOnly = true)
    public ChallengeDetailDTO getChallengeDetail(Long id, Long userId) {
        Challenge challenge = challengeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Challenge not found"));
        
        ChallengeDetailDTO detailDTO = new ChallengeDetailDTO();
        detailDTO.setId(challenge.getId());
        detailDTO.setTitle(challenge.getTitle());
        detailDTO.setDescription(challenge.getDescription());
        detailDTO.setStatus(challenge.getStatus());
        detailDTO.setTargetValue(challenge.getTargetValue());
        detailDTO.setStartDate(challenge.getStartDate());
        detailDTO.setEndDate(challenge.getEndDate());
        detailDTO.setLinkedCategoryId(challenge.getLinkedCategoryId());
        if (challenge.getLinkedCategoryId() != null) {
            detailDTO.setCarbonCategoryCode(carbonCategoryRepository.findById(challenge.getLinkedCategoryId())
                    .map(com.ecotrack.tracking.entity.CarbonCategory::getCode)
                    .orElse(null));
        }
        detailDTO.setRewardXp(challenge.getRewardXp());
        detailDTO.setProgressMetric(challenge.getProgressMetric());
        detailDTO.setTrackingMethod(challenge.getTrackingMethod());
        detailDTO.setRulesConfig(challenge.getRulesConfig());
        detailDTO.setGlobalProgress(challenge.getGlobalProgress());
        detailDTO.setParticipantCount(participantRepository.countByChallengeId(id));
        detailDTO.setChallengeEvaluationType(challenge.getChallengeEvaluationType());
        detailDTO.setImageUrl(challenge.getImageUrl());
        detailDTO.setDerivedUnit(derivedUnit(challenge));
        
        if (challenge.getBadgeId() != null) {
            badgeRepository.findById(challenge.getBadgeId()).ifPresent(b -> detailDTO.setBadge(mapToAdminBadgeDTO(b)));
        }
        
        participantRepository.findByChallengeIdAndUserId(id, userId)
                .ifPresent(p -> detailDTO.setUserProgress(mapToDTO(p)));
                
        return detailDTO;
    }

    @Transactional
    public ChallengeParticipantDTO joinChallenge(Long id, Long userId) {
        Challenge challenge = challengeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Challenge not found"));
                
        if (challenge.getStatus() != ChallengeStatus.ACTIVE) {
            throw new ChallengeClosedException("Challenge is not active");
        }
        
        if (challenge.getEndDate().isBefore(LocalDateTime.now())) {
            throw new ChallengeClosedException("Challenge has expired");
        }
        
        participantRepository.findByChallengeIdAndUserId(id, userId).ifPresent(p -> {
            throw new ChallengeAlreadyJoinedException("User has already joined this challenge");
        });
        
        ChallengeParticipant participant = ChallengeParticipant.builder()
                .challenge(challenge)
                .userId(userId)
                .build();
                
        participant = participantRepository.save(participant);
        return mapToDTO(participant);
    }

    @Transactional(readOnly = true)
    public Page<ChallengeParticipantDTO> getUserChallenges(Long userId, Pageable pageable) {
        return participantRepository.findByUserId(userId, pageable)
                .map(this::mapToDTO);
    }

    @Transactional
    public ChallengeParticipantDTO updateProgress(Long id, Long userId, com.ecotrack.challenge.dto.ChallengeProgressUpdateRequest request) {
        Challenge challenge = challengeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Challenge not found"));
                
        if (challenge.getTrackingMethod() == TrackingMethod.AUTOMATIC) {
            throw new IllegalArgumentException("This challenge only supports automatic tracking.");
        }

        if (challenge.getStatus() != ChallengeStatus.ACTIVE) {
            throw new ChallengeClosedException("Challenge is not active");
        }
        
        ChallengeParticipant participant = participantRepository.findByChallengeIdAndUserIdForUpdate(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("User is not a participant"));
                
        if (participant.getStatus() == ChallengeParticipantStatus.COMPLETED) {
            return mapToDTO(participant); // already completed
        }
        
        boolean wasCompleted = participant.getStatus() == ChallengeParticipantStatus.COMPLETED;
        com.ecotrack.challenge.enums.ChallengeParticipantStatus oldStatus = participant.getStatus();
        
        participant.setProgress(participant.getProgress().add(request.getDelta()));
        
        ChallengeEvaluationStrategy strategy = strategyResolver.resolve(challenge.getChallengeEvaluationType());
        com.ecotrack.challenge.enums.ChallengeParticipantStatus newStatus = strategy.evaluateLiveStatus(
                participant.getProgress().doubleValue(), 
                (double) challenge.getTargetValue(), 
                oldStatus
        );
        
        participant.setStatus(newStatus);
        
        if (newStatus == com.ecotrack.challenge.enums.ChallengeParticipantStatus.COMPLETED && !wasCompleted) {
            participant.setCompletedAt(LocalDateTime.now());
            eventPublisher.publishEvent(new ChallengeCompletedEvent(userId, challenge.getId(), challenge.getTitle(), challenge.getRewardXp(), java.util.UUID.randomUUID().toString()));
        }
        
        return mapToDTO(participantRepository.save(participant));
    }

    // Admin Methods
    @Transactional
    public ChallengeDTO createChallenge(ChallengeRequest request) {
        validateTrackingConfiguration(request);
        validateBadgeAssignment(request.getBadgeId());
        
        if (request.getStartDate().toLocalDate().isBefore(java.time.LocalDate.now())) {
            throw new IllegalArgumentException("Start date cannot be in the past.");
        }

        Integer reward = request.getRewardXp() != null ? request.getRewardXp() : 500;
        com.ecotrack.challenge.enums.ProgressMetric pMetric = request.getProgressMetric() != null ? request.getProgressMetric() : com.ecotrack.challenge.enums.ProgressMetric.ENTRY_COUNT;
        TrackingMethod tMethod = request.getTrackingMethod() != null ? request.getTrackingMethod() : TrackingMethod.MANUAL;
        
        Long finalLinkedCategoryId = request.getLinkedCategoryId();
        if (request.getCarbonCategoryCode() != null && !request.getCarbonCategoryCode().isBlank()) {
            finalLinkedCategoryId = carbonCategoryRepository.findByCode(request.getCarbonCategoryCode())
                    .map(com.ecotrack.tracking.entity.CarbonCategory::getCategoryId)
                    .orElse(finalLinkedCategoryId);
        }
        
        Challenge challenge = Challenge.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .targetValue(request.getTargetValue())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .linkedCategoryId(finalLinkedCategoryId)
                .rewardXp(reward)
                .progressMetric(pMetric)
                .trackingMethod(tMethod)
                .challengeEvaluationType(request.getChallengeEvaluationType() != null ? request.getChallengeEvaluationType() : com.ecotrack.challenge.enums.ChallengeEvaluationType.ACHIEVEMENT)
                .rulesConfig(request.getRulesConfig())
                .status(ChallengeStatus.PENDING)
                .imageUrl(request.getImageUrl())
                .badgeId(request.getBadgeId())
                .build();
                
        return mapToDTO(challengeRepository.save(challenge));
    }

    @Transactional
    public ChallengeDTO updateChallenge(Long id, ChallengeRequest request) {
        validateTrackingConfiguration(request);
        validateBadgeAssignment(request.getBadgeId());
        
        if (request.getStartDate().toLocalDate().isBefore(java.time.LocalDate.now())) {
            throw new IllegalArgumentException("Start date cannot be in the past.");
        }
        
        Challenge challenge = challengeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Challenge not found"));
                
        if (challenge.getStatus() != ChallengeStatus.PENDING && challenge.getStatus() != ChallengeStatus.UPCOMING) {
            throw new IllegalStateException("Only PENDING or UPCOMING challenges can be edited.");
        }

        challenge.setTitle(request.getTitle());
        challenge.setDescription(request.getDescription());
        challenge.setTargetValue(request.getTargetValue());
        challenge.setStartDate(request.getStartDate());
        challenge.setEndDate(request.getEndDate());
        
        if (request.getCarbonCategoryCode() != null && !request.getCarbonCategoryCode().isBlank()) {
            carbonCategoryRepository.findByCode(request.getCarbonCategoryCode())
                    .ifPresent(cat -> challenge.setLinkedCategoryId(cat.getCategoryId()));
        } else if (request.getLinkedCategoryId() != null) {
            challenge.setLinkedCategoryId(request.getLinkedCategoryId());
        }
        if (request.getRewardXp() != null) challenge.setRewardXp(request.getRewardXp());
        if (request.getProgressMetric() != null) challenge.setProgressMetric(request.getProgressMetric());
        if (request.getTrackingMethod() != null) challenge.setTrackingMethod(request.getTrackingMethod());
        if (request.getChallengeEvaluationType() != null) challenge.setChallengeEvaluationType(request.getChallengeEvaluationType());
        challenge.setRulesConfig(request.getRulesConfig());
        challenge.setImageUrl(request.getImageUrl());
        challenge.setBadgeId(request.getBadgeId());
        
        return mapToDTO(challengeRepository.save(challenge));
    }

    @Transactional
    public String uploadImage(Long id, MultipartFile file) throws IOException {
        Challenge challenge = challengeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Challenge not found"));

        String UPLOAD_DIR = "uploads/challenge-images/";
        String fileName = FileUploadUtil.saveProfileImage(file, UPLOAD_DIR, id);
        String imagePath = UPLOAD_DIR + fileName;

        challenge.setImageUrl(imagePath);
        challengeRepository.save(challenge);

        return imagePath;
    }

    @Transactional
    public ChallengeDTO moderateChallenge(Long id, String action) {
        Challenge challenge = challengeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Challenge not found"));
                
        if (challenge.getStatus() != ChallengeStatus.PENDING) {
            throw new IllegalStateException("Only PENDING challenges can be moderated.");
        }
                
        if ("APPROVE".equalsIgnoreCase(action)) {
            if (challenge.getStartDate().toLocalDate().isAfter(java.time.LocalDate.now())) {
                challenge.setStatus(ChallengeStatus.UPCOMING);
            } else {
                challenge.setStatus(ChallengeStatus.ACTIVE);
            }
        } else if ("REJECT".equalsIgnoreCase(action)) {
            challenge.setStatus(ChallengeStatus.CLOSED);
        }
        
        return mapToDTO(challengeRepository.save(challenge));
    }

    @Transactional
    public void archiveChallenge(Long id) {
        Challenge challenge = challengeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Challenge not found"));
                
        if (challenge.getStatus() == ChallengeStatus.ARCHIVED) {
            throw new IllegalStateException("Challenge is already archived.");
        }
        
        challenge.setStatus(ChallengeStatus.ARCHIVED);
        challengeRepository.save(challenge);
    }
    
    @Transactional
    public BulkActionResult bulkModerate(BulkModerateRequest request) {
        List<Long> succeeded = new java.util.ArrayList<>();
        List<Long> failed = new java.util.ArrayList<>();
        
        for (Long id : request.getIds()) {
            try {
                moderateChallenge(id, request.getAction());
                succeeded.add(id);
            } catch (Exception e) {
                log.error("Failed to moderate challenge {}: {}", id, e.getMessage());
                failed.add(id);
            }
        }
        return new BulkActionResult(succeeded, failed);
    }

    @Transactional
    public BulkActionResult bulkArchive(BulkArchiveRequest request) {
        List<Long> succeeded = new java.util.ArrayList<>();
        List<Long> failed = new java.util.ArrayList<>();
        
        for (Long id : request.getIds()) {
            try {
                archiveChallenge(id);
                succeeded.add(id);
            } catch (Exception e) {
                log.error("Failed to archive challenge {}: {}", id, e.getMessage());
                failed.add(id);
            }
        }
        return new BulkActionResult(succeeded, failed);
    }
    
    @Transactional(readOnly = true)
    public Page<ChallengeDTO> getAllChallenges(String search, ChallengeStatus status, TrackingMethod trackingMethod, com.ecotrack.challenge.enums.ChallengeEvaluationType evaluationType, Long categoryId, Pageable pageable) {
        Page<Challenge> page = challengeRepository.findAll(ChallengeSpecification.filter(search, status, trackingMethod, evaluationType, categoryId), pageable);
        return mapToDTOPage(page);
    }
    
    @Transactional(readOnly = true)
    public ChallengeDetailDTO getAdminChallengeDetail(Long id) {
        Challenge challenge = challengeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Challenge not found"));
        
        ChallengeDetailDTO detailDTO = new ChallengeDetailDTO();
        detailDTO.setId(challenge.getId());
        detailDTO.setTitle(challenge.getTitle());
        detailDTO.setDescription(challenge.getDescription());
        detailDTO.setStatus(challenge.getStatus());
        detailDTO.setTargetValue(challenge.getTargetValue());
        detailDTO.setStartDate(challenge.getStartDate());
        detailDTO.setEndDate(challenge.getEndDate());
        detailDTO.setLinkedCategoryId(challenge.getLinkedCategoryId());
        detailDTO.setRewardXp(challenge.getRewardXp());
        detailDTO.setProgressMetric(challenge.getProgressMetric());
        detailDTO.setTrackingMethod(challenge.getTrackingMethod());
        detailDTO.setRulesConfig(challenge.getRulesConfig());
        detailDTO.setGlobalProgress(challenge.getGlobalProgress());
        detailDTO.setParticipantCount(participantRepository.countByChallengeId(id));
        detailDTO.setChallengeEvaluationType(challenge.getChallengeEvaluationType());
        detailDTO.setImageUrl(challenge.getImageUrl());
        detailDTO.setDerivedUnit(derivedUnit(challenge));
        
        if (challenge.getBadgeId() != null) {
            badgeRepository.findById(challenge.getBadgeId()).ifPresent(b -> detailDTO.setBadge(mapToAdminBadgeDTO(b)));
        }
        
        return detailDTO;
    }
    
    @Transactional(readOnly = true)
    public Page<ChallengeParticipantDTO> getChallengeParticipants(Long challengeId, Pageable pageable) {
        return participantRepository.findByChallengeId(challengeId, pageable).map(this::mapToDTO);
    }
    
    @Transactional(readOnly = true)
    public ChallengeStatsDTO getChallengeStats() {
        long total = challengeRepository.count();
        long active = 0, upcoming = 0, completed = 0, archived = 0, draft = 0;

        java.util.List<Object[]> statusCounts = challengeRepository.countChallengesByStatus();
        for (Object[] row : statusCounts) {
            ChallengeStatus s = (ChallengeStatus) row[0];
            long count = ((Number) row[1]).longValue();
            if (s == ChallengeStatus.ACTIVE) active = count;
            else if (s == ChallengeStatus.UPCOMING) upcoming = count;
            else if (s == ChallengeStatus.COMPLETED) completed = count;
            else if (s == ChallengeStatus.ARCHIVED) archived = count;
            else if (s == ChallengeStatus.PENDING) draft = count;
        }

        long participants = participantRepository.countDistinctUsers();
        
        double completionRate = total > 0 ? Math.round(((double) completed / total) * 1000.0) / 10.0 : 0.0;
        long xpDistributed = participantRepository.sumTotalXpDistributed();
        double co2Impact = Math.round(participantRepository.sumTotalCo2Impact() * 10.0) / 10.0;
        
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.LocalDateTime thirtyDaysAgo = now.minusDays(30);
        java.time.LocalDateTime sixtyDaysAgo = now.minusDays(60);
        
        long createdLast30 = challengeRepository.countByCreatedAtBetween(thirtyDaysAgo, now);
        long createdPrevious30 = challengeRepository.countByCreatedAtBetween(sixtyDaysAgo, thirtyDaysAgo);
        
        Double totalChallengesTrend = null;
        if (createdPrevious30 > 0) {
            totalChallengesTrend = Math.round((((double) createdLast30 - createdPrevious30) / createdPrevious30) * 100.0 * 10.0) / 10.0;
        } else if (createdLast30 > 0) {
            totalChallengesTrend = 100.0; // 100% increase if previous was 0 and now we have some
        }
        
        return ChallengeStatsDTO.builder()
                .totalChallenges(total)
                .activeCount(active)
                .scheduledCount(upcoming)
                .completedCount(completed)
                .archivedCount(archived)
                .draftCount(draft)
                .totalParticipants(participants)
                .completionRate(completionRate)
                .xpDistributed(xpDistributed)
                .co2Impact(co2Impact)
                .totalChallengesTrend(totalChallengesTrend)
                .activeCountTrend(null)
                .scheduledCountTrend(null)
                .draftCountTrend(null)
                .build();
    }
    
    @Transactional(readOnly = true)
    public ChallengeAnalyticsDTO getChallengeAnalytics() {
        java.util.Map<String, Long> statusMap = new java.util.HashMap<>();
        for (Object[] row : challengeRepository.countChallengesByStatus()) {
            ChallengeStatus status = (ChallengeStatus) row[0];
            Number count = (Number) row[1];
            statusMap.put(status.name(), count.longValue());
        }

        java.util.Map<String, Long> monthMap = new java.util.HashMap<>();
        for (Object[] row : participantRepository.countParticipationByMonth()) {
            String month = (String) row[0];
            Number count = (Number) row[1];
            monthMap.put(month, count.longValue());
        }

        return ChallengeAnalyticsDTO.builder()
                .challengesByStatus(statusMap)
                .participationByMonth(monthMap)
                .build();
    }

    private Page<ChallengeDTO> mapToDTOPage(Page<Challenge> page) {
        List<Long> challengeIds = page.getContent().stream().map(Challenge::getId).toList();
        java.util.Map<Long, Long> counts = new java.util.HashMap<>();
        if (!challengeIds.isEmpty()) {
            for (Object[] row : participantRepository.countParticipantsByChallengeIds(challengeIds)) {
                counts.put((Long) row[0], ((Number) row[1]).longValue());
            }
        }
        
        List<Long> categoryIds = page.getContent().stream()
                .map(Challenge::getLinkedCategoryId)
                .filter(id -> id != null)
                .distinct()
                .toList();
        java.util.Map<Long, String> categoryCodes = new java.util.HashMap<>();
        if (!categoryIds.isEmpty()) {
            carbonCategoryRepository.findAllById(categoryIds).forEach(cat -> 
                categoryCodes.put(cat.getCategoryId(), cat.getCode())
            );
        }

        return page.map(c -> mapToDTO(c, counts.getOrDefault(c.getId(), 0L), categoryCodes.get(c.getLinkedCategoryId())));
    }

    private ChallengeDTO mapToDTO(Challenge c) {
        String carbonCategoryCode = null;
        if (c.getLinkedCategoryId() != null) {
            carbonCategoryCode = carbonCategoryRepository.findById(c.getLinkedCategoryId())
                    .map(com.ecotrack.tracking.entity.CarbonCategory::getCode)
                    .orElse(null);
        }
        return mapToDTO(c, participantRepository.countByChallengeId(c.getId()), carbonCategoryCode);
    }

    private ChallengeDTO mapToDTO(Challenge c, long participantCount, String carbonCategoryCode) {
        return ChallengeDTO.builder()
                .id(c.getId())
                .title(c.getTitle())
                .description(c.getDescription())
                .status(c.getStatus())
                .targetValue(c.getTargetValue())
                .startDate(c.getStartDate())
                .endDate(c.getEndDate())
                .linkedCategoryId(c.getLinkedCategoryId())
                .carbonCategoryCode(carbonCategoryCode)
                .rewardXp(c.getRewardXp())
                .progressMetric(c.getProgressMetric())
                .trackingMethod(c.getTrackingMethod())
                .challengeEvaluationType(c.getChallengeEvaluationType())
                .rulesConfig(c.getRulesConfig())
                .globalProgress(c.getGlobalProgress())
                .derivedUnit(derivedUnit(c))
                .participantCount(participantCount)
                .imageUrl(c.getImageUrl())
                .badge(c.getBadgeId() != null ? badgeRepository.findById(c.getBadgeId()).map(this::mapToAdminBadgeDTO).orElse(null) : null)
                .build();
    }
    
    private String derivedUnit(Challenge c) {
        if (c.getProgressMetric() == com.ecotrack.challenge.enums.ProgressMetric.CARBON_EMISSION) return "kgCO2e";
        if (c.getProgressMetric() == com.ecotrack.challenge.enums.ProgressMetric.ENTRY_COUNT) return ""; 
        if (c.getProgressMetric() == com.ecotrack.challenge.enums.ProgressMetric.QUANTITY && c.getRulesConfig() != null) {
            java.util.List<Long> ids = c.getRulesConfig().allowedSubcategoryIds();
            if (ids != null && !ids.isEmpty()) {
                return carbonSubCategoryRepository.findById(ids.get(0))
                    .map(com.ecotrack.tracking.entity.CarbonSubCategory::getDefaultUnit)
                    .orElse("");
            }
            if (c.getLinkedCategoryId() != null) {
                java.util.List<com.ecotrack.tracking.entity.CarbonSubCategory> subs = carbonSubCategoryRepository.findByCategory_CategoryId(c.getLinkedCategoryId());
                if (!subs.isEmpty()) {
                    return subs.get(0).getDefaultUnit();
                }
            }
        }
        return "";
    }
    
    private ChallengeParticipantDTO mapToDTO(ChallengeParticipant p) {
        return ChallengeParticipantDTO.builder()
                .id(p.getId())
                .challengeId(p.getChallenge().getId())
                .userId(p.getUserId())
                .progress(p.getProgress())
                .status(p.getStatus())
                .joinedAt(p.getJoinedAt())
                .completedAt(p.getCompletedAt())
                .userName(userRepository.findById(p.getUserId()).map(u -> u.getName()).orElse("Unknown User"))
                .challengeTitle(p.getChallenge().getTitle())
                .targetValue(p.getChallenge().getTargetValue())
                .progressMetric(p.getChallenge().getProgressMetric())
                .build();
    }



    private void validateTrackingConfiguration(ChallengeRequest request) {
        TrackingMethod method = request.getTrackingMethod() != null ? request.getTrackingMethod() : TrackingMethod.MANUAL;
        if (method == TrackingMethod.AUTOMATIC) {
            if (!isValidAutomaticTrackingConfiguration(request)) {
                throw new IllegalArgumentException("Linked category or multi-source configuration is required for AUTOMATIC tracking method.");
            }
            validateUnitCompatibility(request);
            validateSubcategoryBelongsToCategory(request);
        }
        if (method == TrackingMethod.MANUAL) {
            request.setLinkedCategoryId(null);
            request.setRulesConfig(null);
        }
    }

    private void validateUnitCompatibility(ChallengeRequest request) {
        if (request.getProgressMetric() != com.ecotrack.challenge.enums.ProgressMetric.QUANTITY) return;
        List<Long> ids = request.getRulesConfig() != null ? request.getRulesConfig().allowedSubcategoryIds() : null;
        if (ids == null || ids.size() <= 1) return;
        List<String> units = carbonSubCategoryRepository.findAllById(ids)
            .stream().map(com.ecotrack.tracking.entity.CarbonSubCategory::getDefaultUnit).distinct().toList();
        if (units.size() > 1) {
            throw new IllegalArgumentException("All selected subcategories must share the same unit for QUANTITY tracking. Found: " + units);
        }
    }

    private void validateSubcategoryBelongsToCategory(ChallengeRequest request) {
        if (request.getLinkedCategoryId() == null) return; // Cross-category challenges allowed (e.g. Carbon Reduction)
        List<Long> ids = request.getRulesConfig() != null ? request.getRulesConfig().allowedSubcategoryIds() : null;
        if (ids == null || ids.isEmpty()) return;
        
        List<com.ecotrack.tracking.entity.CarbonSubCategory> subs = carbonSubCategoryRepository.findAllById(ids);
        for (com.ecotrack.tracking.entity.CarbonSubCategory sub : subs) {
            if (!sub.getCategory().getCategoryId().equals(request.getLinkedCategoryId())) {
                throw new IllegalArgumentException("Subcategory does not belong to selected category");
            }
        }
    }

    private boolean isValidAutomaticTrackingConfiguration(ChallengeRequest request) {
        boolean hasLinkedCategory = request.getLinkedCategoryId() != null;
        boolean hasCarbonCode = request.getCarbonCategoryCode() != null && !request.getCarbonCategoryCode().isBlank();
        boolean hasMultiSource = request.getRulesConfig() != null 
            && request.getRulesConfig().allowedSubcategoryIds() != null 
            && !request.getRulesConfig().allowedSubcategoryIds().isEmpty();
            
        return hasLinkedCategory || hasCarbonCode || hasMultiSource;
    }

    private void validateBadgeAssignment(Long badgeId) {
        if (badgeId != null) {
            Badge badge = badgeRepository.findById(badgeId)
                    .orElseThrow(() -> new IllegalArgumentException("Selected badge not found"));
            if (badge.getIsHidden()) {
                throw new IllegalArgumentException("Selected badge is disabled/hidden");
            }
            if (badge.getType() != BadgeType.CHALLENGE) {
                throw new IllegalArgumentException("Only CHALLENGE badges can be assigned to challenges");
            }
        }
    }

    private AdminBadgeDTO mapToAdminBadgeDTO(Badge badge) {
        return AdminBadgeDTO.builder()
                .id(badge.getId())
                .name(badge.getName())
                .category(badge.getCategory())
                .description(badge.getDescription())
                .rarity(badge.getRarity())
                .type(badge.getType())
                .icon(badge.getIcon())
                .color(badge.getColor())
                .isHidden(badge.getIsHidden())
                .isRepeatable(badge.getIsRepeatable())
                .criteriaType(badge.getCriteriaType())
                .criteriaThreshold(badge.getCriteriaThreshold())
                .createdAt(badge.getCreatedAt())
                .build();
    }
}
