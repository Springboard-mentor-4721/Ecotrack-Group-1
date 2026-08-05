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
import com.ecotrack.user.util.FileUploadUtil;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
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
    private final CarbonCategoryRepository carbonCategoryRepository;

    @Transactional(readOnly = true)
    public Page<ChallengeDTO> getActiveChallenges(Pageable pageable) {
        return challengeRepository.findByStatus(ChallengeStatus.ACTIVE, pageable)
                .map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public ChallengeDetailDTO getChallengeDetail(Long id, Long userId) {
        Challenge challenge = challengeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Challenge not found"));
        
        ChallengeDetailDTO detailDTO = new ChallengeDetailDTO();
        detailDTO.setId(challenge.getId());
        detailDTO.setTitle(challenge.getTitle());
        detailDTO.setDescription(challenge.getDescription());
        detailDTO.setTypeCode(challenge.getTypeCode());
        detailDTO.setStatus(challenge.getStatus());
        detailDTO.setTargetValue(challenge.getTargetValue());
        detailDTO.setStartDate(challenge.getStartDate());
        detailDTO.setEndDate(challenge.getEndDate());
        detailDTO.setLinkedCategoryId(challenge.getLinkedCategoryId());
        detailDTO.setRewardXp(challenge.getRewardXp());
        detailDTO.setProgressType(challenge.getProgressType());
        detailDTO.setTrackingMethod(challenge.getTrackingMethod());
        detailDTO.setRulesConfig(challenge.getRulesConfig());
        detailDTO.setCommunityProgress(challenge.getCommunityProgress());
        detailDTO.setImageUrl(challenge.getImageUrl());
        
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
        
        ChallengeParticipant participant = participantRepository.findByChallengeIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("User is not a participant"));
                
        if (participant.getStatus() == ChallengeParticipantStatus.COMPLETED) {
            return mapToDTO(participant); // already completed
        }
        
        participant.setProgress(participant.getProgress() + request.getDelta());
        
        if (participant.getProgress() >= challenge.getTargetValue()) {
            participant.setStatus(ChallengeParticipantStatus.COMPLETED);
            participant.setCompletedAt(LocalDateTime.now());
        }
        
        return mapToDTO(participantRepository.save(participant));
    }

    // Admin Methods
    @Transactional
    public ChallengeDTO createChallenge(ChallengeRequest request) {
        validateChallengeType(request.getTypeCode());
        validateTrackingConfiguration(request);

        Integer reward = request.getRewardXp() != null ? request.getRewardXp() : 500;
        com.ecotrack.challenge.enums.ProgressType pType = request.getProgressType() != null ? request.getProgressType() : com.ecotrack.challenge.enums.ProgressType.COUNT;
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
                .typeCode(request.getTypeCode())
                .targetValue(request.getTargetValue())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .linkedCategoryId(finalLinkedCategoryId)
                .rewardXp(reward)
                .progressType(pType)
                .trackingMethod(tMethod)
                .challengeEvaluationType(request.getChallengeEvaluationType() != null ? request.getChallengeEvaluationType() : com.ecotrack.challenge.enums.ChallengeEvaluationType.ACHIEVEMENT)
                .rulesConfig(request.getRulesConfig())
                .status(ChallengeStatus.PENDING)
                .build();
                
        return mapToDTO(challengeRepository.save(challenge));
    }

    @Transactional
    public ChallengeDTO updateChallenge(Long id, ChallengeRequest request) {
        validateChallengeType(request.getTypeCode());
        validateTrackingConfiguration(request);
        
        Challenge challenge = challengeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Challenge not found"));
                
        if (challenge.getStatus() != ChallengeStatus.PENDING && challenge.getStatus() != ChallengeStatus.UPCOMING) {
            throw new IllegalStateException("Only PENDING or UPCOMING challenges can be edited.");
        }

        challenge.setTitle(request.getTitle());
        challenge.setDescription(request.getDescription());
        challenge.setTypeCode(request.getTypeCode());
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
        if (request.getProgressType() != null) challenge.setProgressType(request.getProgressType());
        if (request.getTrackingMethod() != null) challenge.setTrackingMethod(request.getTrackingMethod());
        if (request.getChallengeEvaluationType() != null) challenge.setChallengeEvaluationType(request.getChallengeEvaluationType());
        challenge.setRulesConfig(request.getRulesConfig());
        challenge.setImageUrl(request.getImageUrl());
        
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
            if (challenge.getStartDate().isAfter(LocalDateTime.now())) {
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
    public Page<ChallengeDTO> getAllChallenges(String search, ChallengeStatus status, TrackingMethod trackingMethod, Long categoryId, Pageable pageable) {
        return challengeRepository.findAll(ChallengeSpecification.filter(search, status, trackingMethod, categoryId), pageable).map(this::mapToDTO);
    }
    
    @Transactional(readOnly = true)
    public ChallengeDetailDTO getAdminChallengeDetail(Long id) {
        Challenge challenge = challengeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Challenge not found"));
        
        ChallengeDetailDTO detailDTO = new ChallengeDetailDTO();
        detailDTO.setId(challenge.getId());
        detailDTO.setTitle(challenge.getTitle());
        detailDTO.setDescription(challenge.getDescription());
        detailDTO.setTypeCode(challenge.getTypeCode());
        detailDTO.setStatus(challenge.getStatus());
        detailDTO.setTargetValue(challenge.getTargetValue());
        detailDTO.setStartDate(challenge.getStartDate());
        detailDTO.setEndDate(challenge.getEndDate());
        detailDTO.setLinkedCategoryId(challenge.getLinkedCategoryId());
        detailDTO.setRewardXp(challenge.getRewardXp());
        detailDTO.setProgressType(challenge.getProgressType());
        detailDTO.setTrackingMethod(challenge.getTrackingMethod());
        detailDTO.setRulesConfig(challenge.getRulesConfig());
        detailDTO.setCommunityProgress(challenge.getCommunityProgress());
        detailDTO.setParticipantCount(participantRepository.countByChallengeId(id));
        detailDTO.setImageUrl(challenge.getImageUrl());
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
        return ChallengeAnalyticsDTO.builder()
                .challengesByStatus(java.util.Collections.emptyMap())
                .participationByMonth(java.util.Collections.emptyMap())
                .build();
    }

    private ChallengeDTO mapToDTO(Challenge c) {
        return ChallengeDTO.builder()
                .id(c.getId())
                .title(c.getTitle())
                .description(c.getDescription())
                .typeCode(c.getTypeCode())
                .status(c.getStatus())
                .targetValue(c.getTargetValue())
                .startDate(c.getStartDate())
                .endDate(c.getEndDate())
                .linkedCategoryId(c.getLinkedCategoryId())
                .rewardXp(c.getRewardXp())
                .progressType(c.getProgressType())
                .trackingMethod(c.getTrackingMethod())
                .challengeEvaluationType(c.getChallengeEvaluationType())
                .rulesConfig(c.getRulesConfig())
                .communityProgress(c.getCommunityProgress())
                .participantCount(participantRepository.countByChallengeId(c.getId()))
                .imageUrl(c.getImageUrl())
                .build();
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
                .build();
    }

    private void validateChallengeType(String typeCode) {
        if ("PERSONAL".equalsIgnoreCase(typeCode) || "RECURRING".equalsIgnoreCase(typeCode)) {
            throw new IllegalArgumentException("Cannot create PERSONAL or RECURRING challenges.");
        }
    }

    private void validateTrackingConfiguration(ChallengeRequest request) {
        TrackingMethod method = request.getTrackingMethod() != null ? request.getTrackingMethod() : TrackingMethod.MANUAL;
        if (method == TrackingMethod.AUTOMATIC) {
            if (request.getLinkedCategoryId() == null) {
                throw new IllegalArgumentException("Linked category is required for AUTOMATIC tracking method.");
            }
        }
        if (method == TrackingMethod.MANUAL) {
            request.setLinkedCategoryId(null);
            request.setRulesConfig(null);
        }
    }
}
