package com.ecotrack.challenge.service;

import com.ecotrack.challenge.dto.ChallengeDTO;
import com.ecotrack.challenge.dto.ChallengeDetailDTO;
import com.ecotrack.challenge.dto.ChallengeParticipantDTO;
import com.ecotrack.challenge.dto.ChallengeRequest;
import com.ecotrack.challenge.entity.Challenge;
import com.ecotrack.challenge.entity.ChallengeParticipant;
import com.ecotrack.challenge.enums.ChallengeParticipantStatus;
import com.ecotrack.challenge.enums.ChallengeStatus;
import com.ecotrack.challenge.exception.ChallengeAlreadyJoinedException;
import com.ecotrack.challenge.exception.ChallengeClosedException;
import com.ecotrack.challenge.repository.ChallengeParticipantRepository;
import com.ecotrack.challenge.repository.ChallengeRepository;
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
        // participantCount omitted for simplicity
        
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
            // Normally we'd publish an event here, but the engine usually handles it for carbon entries.
            // If manual progress is allowed, we publish it here too:
            // eventPublisher.publishEvent(new com.ecotrack.event.ChallengeCompletedEvent(userId, challenge.getId(), challenge.getTitle()));
        }
        
        return mapToDTO(participantRepository.save(participant));
    }

    // Admin Methods
    @Transactional
    public ChallengeDTO createChallenge(ChallengeRequest request) {
        Challenge challenge = Challenge.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .typeCode(request.getTypeCode())
                .targetValue(request.getTargetValue())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(ChallengeStatus.PENDING)
                .build();
                
        return mapToDTO(challengeRepository.save(challenge));
    }

    @Transactional
    public ChallengeDTO updateChallenge(Long id, ChallengeRequest request) {
        Challenge challenge = challengeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Challenge not found"));
                
        challenge.setTitle(request.getTitle());
        challenge.setDescription(request.getDescription());
        challenge.setTypeCode(request.getTypeCode());
        challenge.setTargetValue(request.getTargetValue());
        challenge.setStartDate(request.getStartDate());
        challenge.setEndDate(request.getEndDate());
        
        return mapToDTO(challengeRepository.save(challenge));
    }

    @Transactional
    public ChallengeDTO moderateChallenge(Long id, String action) {
        Challenge challenge = challengeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Challenge not found"));
                
        if ("APPROVE".equalsIgnoreCase(action)) {
            challenge.setStatus(ChallengeStatus.ACTIVE);
        } else if ("REJECT".equalsIgnoreCase(action)) {
            challenge.setStatus(ChallengeStatus.CLOSED);
        }
        
        return mapToDTO(challengeRepository.save(challenge));
    }

    @Transactional
    public void archiveChallenge(Long id) {
        Challenge challenge = challengeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Challenge not found"));
        challenge.setStatus(ChallengeStatus.ARCHIVED);
        challengeRepository.save(challenge);
    }
    
    @Transactional(readOnly = true)
    public Page<ChallengeDTO> getAllChallenges(Pageable pageable) {
        return challengeRepository.findAll(pageable).map(this::mapToDTO);
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
}
