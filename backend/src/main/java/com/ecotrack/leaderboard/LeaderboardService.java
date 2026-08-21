package com.ecotrack.leaderboard;

import com.ecotrack.gamification.repository.UserGamificationProfileRepository;
import com.ecotrack.user.repository.UserRepository;
import com.ecotrack.user.entity.User;
import com.ecotrack.challenge.repository.ChallengeRepository;
import com.ecotrack.challenge.repository.ChallengeParticipantRepository;
import com.ecotrack.user.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final UserGamificationProfileRepository profileRepository;
    private final com.ecotrack.gamification.repository.XpLedgerRepository xpLedgerRepository;
    private final UserRepository userRepository;
    private final ChallengeRepository challengeRepository;
    private final ChallengeParticipantRepository challengeParticipantRepository;
    private final UserProfileRepository userProfileRepository;

    public List<LeaderboardEntryDTO> getAllTimeLeaderboard() {
        var topProfiles = profileRepository.findTop50ByOrderByLifetimeEcoXpDesc();
        
        List<Long> userIds = topProfiles.stream()
                .map(p -> p.getUserId())
                .collect(Collectors.toList());
                
        Map<Long, String> userNames = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, User::getName));

        List<LeaderboardEntryDTO> dtos = new java.util.ArrayList<>();
        int rank = 1;
        for (int i = 0; i < topProfiles.size(); i++) {
            var p = topProfiles.get(i);
            long currentXp = p.getLifetimeEcoXp() != null ? p.getLifetimeEcoXp() : 0L;
            long xpToNextRank = 0L;
            
            if (i > 0) {
                long prevXp = topProfiles.get(i - 1).getLifetimeEcoXp() != null ? topProfiles.get(i - 1).getLifetimeEcoXp() : 0L;
                xpToNextRank = Math.max(0, prevXp - currentXp + 1);
            }
            
            var userProfileOpt = userProfileRepository.findByUser_Id(p.getUserId());
            String profilePic = userProfileOpt.isPresent() ? userProfileOpt.get().getProfilePictureUrl() : null;
            
            dtos.add(LeaderboardEntryDTO.builder()
                        .userId(p.getUserId())
                        .username(userNames.getOrDefault(p.getUserId(), "User " + p.getUserId()))
                        .scoreValue(currentXp)
                        .rank(rank++)
                        .level(p.getCurrentLevel())
                        .xpToNextRank(xpToNextRank)
                        .profilePictureUrl(profilePic)
                        .build());
        }
        return dtos;
    }

    public List<LeaderboardEntryDTO> getMonthlyLeaderboard() {
        java.time.LocalDateTime startOfMonth = java.time.LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        var rows = xpLedgerRepository.findTopUsersByXpSince(startOfMonth, org.springframework.data.domain.PageRequest.of(0, 50));
        return mapRowsToLeaderboard(rows);
    }

    public List<LeaderboardEntryDTO> getWeeklyLeaderboard() {
        java.time.LocalDateTime startOfWeek = java.time.LocalDateTime.now().minusDays(7);
        var rows = xpLedgerRepository.findTopUsersByXpSince(startOfWeek, org.springframework.data.domain.PageRequest.of(0, 50));
        return mapRowsToLeaderboard(rows);
    }

    private List<LeaderboardEntryDTO> mapRowsToLeaderboard(List<Object[]> rows) {
        List<Long> userIds = rows.stream().map(row -> (Long) row[0]).collect(Collectors.toList());
        Map<Long, com.ecotrack.gamification.entity.UserGamificationProfile> profiles = profileRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(com.ecotrack.gamification.entity.UserGamificationProfile::getUserId, p -> p));

        List<LeaderboardEntryDTO> dtos = new java.util.ArrayList<>();
        int rank = 1;
        for (int i = 0; i < rows.size(); i++) {
            Object[] row = rows.get(i);
            long currentXp = ((Number) row[2]).longValue();
            long xpToNextRank = 0L;
            if (i > 0) {
                long prevXp = ((Number) rows.get(i - 1)[2]).longValue();
                xpToNextRank = Math.max(0, prevXp - currentXp + 1);
            }
            Long uId = (Long) row[0];
            var p = profiles.get(uId);
            int level = p != null ? p.getCurrentLevel() : 1;

            var userProfileOpt = userProfileRepository.findByUser_Id(uId);
            String profilePic = userProfileOpt.isPresent() ? userProfileOpt.get().getProfilePictureUrl() : null;

            dtos.add(LeaderboardEntryDTO.builder()
                    .userId(uId)
                    .username((String) row[1])
                    .scoreValue(currentXp)
                    .rank(rank++)
                    .level(level)
                    .xpToNextRank(xpToNextRank)
                    .profilePictureUrl(profilePic)
                    .build());
        }
        return dtos;
    }

    public LeaderboardEntryDTO getMyRank(Long userId, com.ecotrack.leaderboard.enums.LeaderboardType type, com.ecotrack.leaderboard.enums.LeaderboardPeriod period) {
        if (type == com.ecotrack.leaderboard.enums.LeaderboardType.ECO_SCORE) {
            return profileRepository.findByUserId(userId)
                    .map(profile -> {
                        double ecoScore = profile.getCurrentEcoScore() != null ? profile.getCurrentEcoScore().doubleValue() : 0.0;
                        long betterRankCount = profileRepository.countDistinctByCurrentEcoScoreGreaterThan(new java.math.BigDecimal(ecoScore));
                        String username = userRepository.findById(userId).map(User::getName).orElse("User " + userId);
                        var userProfileOpt = userProfileRepository.findByUser_Id(userId);
                        String profilePic = userProfileOpt.isPresent() ? userProfileOpt.get().getProfilePictureUrl() : null;

                        return LeaderboardEntryDTO.builder()
                                .userId(userId)
                                .username(username)
                                .metricValue(new java.math.BigDecimal(ecoScore))
                                .rank((int) betterRankCount + 1)
                                .level(profile.getCurrentLevel())
                                .profilePictureUrl(profilePic)
                                .build();
                    })
                    .orElseGet(() -> LeaderboardEntryDTO.builder().userId(userId).rank(-1).build());
        } else if (period == com.ecotrack.leaderboard.enums.LeaderboardPeriod.MONTHLY) {
            return getMyMonthlyRank(userId);
        } else if (period == com.ecotrack.leaderboard.enums.LeaderboardPeriod.WEEKLY) {
            // Fallback for weekly if needed
            return getMyMonthlyRank(userId); 
        } else {
            return profileRepository.findByUserId(userId)
                    .map(profile -> {
                        long xp = profile.getLifetimeEcoXp() != null ? profile.getLifetimeEcoXp() : 0L;
                        long betterRankCount = profileRepository.countDistinctByLifetimeEcoXpGreaterThan(xp);
                        String username = userRepository.findById(userId)
                                .map(User::getName)
                                .orElse("User " + userId);
                                
                        long xpToNextRank = 0L;
                        if (betterRankCount > 0) {
                            xpToNextRank = profileRepository.findLowestXpGreaterThan(xp)
                                    .map(val -> val - xp + 1)
                                    .orElse(0L);
                        }

                        var userProfileOpt = userProfileRepository.findByUser_Id(userId);
                        String profilePic = userProfileOpt.isPresent() ? userProfileOpt.get().getProfilePictureUrl() : null;

                        return LeaderboardEntryDTO.builder()
                                .userId(userId)
                                .username(username)
                                .scoreValue(xp)
                                .rank((int) betterRankCount + 1)
                                .level(profile.getCurrentLevel())
                                .xpToNextRank(xpToNextRank)
                                .profilePictureUrl(profilePic)
                                .build();
                    })
                    .orElseGet(() -> LeaderboardEntryDTO.builder().userId(userId).rank(-1).build());
        }
    }

    public LeaderboardEntryDTO getMyMonthlyRank(Long userId) {
        java.time.LocalDateTime startOfMonth = java.time.LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        
        long myMonthlyXp = xpLedgerRepository.findSumByUserIdAndAwardedAtAfter(userId, startOfMonth);
        long betterRankCount = xpLedgerRepository.countUsersWithXpGreaterThanSince(myMonthlyXp, startOfMonth);
        
        String username = userRepository.findById(userId)
                .map(User::getName)
                .orElse("User " + userId);
                
        var userProfileOpt = userProfileRepository.findByUser_Id(userId);
        String profilePic = userProfileOpt.isPresent() ? userProfileOpt.get().getProfilePictureUrl() : null;
        
        int level = profileRepository.findByUserId(userId).map(p -> p.getCurrentLevel()).orElse(1);

        return LeaderboardEntryDTO.builder()
                .userId(userId)
                .username(username)
                .scoreValue(myMonthlyXp)
                .rank((int) betterRankCount + 1)
                .level(level)
                .xpToNextRank(0L) // Optional: can be calculated later if needed
                .profilePictureUrl(profilePic)
                .build();
    }

    public org.springframework.data.domain.Page<LeaderboardEntryDTO> getGlobalLeaderboard(
            com.ecotrack.leaderboard.enums.LeaderboardType type, 
            com.ecotrack.leaderboard.enums.LeaderboardPeriod period, 
            org.springframework.data.domain.Pageable pageable) {
        
        if (type == com.ecotrack.leaderboard.enums.LeaderboardType.ECO_SCORE) {
            if (period != com.ecotrack.leaderboard.enums.LeaderboardPeriod.ALL_TIME) {
                throw new IllegalArgumentException("Eco Score only supports ALL_TIME");
            }
            var page = profileRepository.findAllByOrderByCurrentEcoScoreDesc(pageable);
            
            List<LeaderboardEntryDTO> dtos = new java.util.ArrayList<>();
            List<Long> userIds = page.getContent().stream().map(p -> p.getUserId()).collect(Collectors.toList());
            Map<Long, String> userNames = userRepository.findAllById(userIds).stream()
                    .collect(Collectors.toMap(User::getId, User::getName));
            
            for (var p : page.getContent()) {
                long rank = profileRepository.countDistinctByCurrentEcoScoreGreaterThan(p.getCurrentEcoScore()) + 1;
                var userProfileOpt = userProfileRepository.findByUser_Id(p.getUserId());
                String profilePic = userProfileOpt.isPresent() ? userProfileOpt.get().getProfilePictureUrl() : null;
                
                dtos.add(LeaderboardEntryDTO.builder()
                        .userId(p.getUserId())
                        .username(userNames.getOrDefault(p.getUserId(), "User " + p.getUserId()))
                        .metricValue(p.getCurrentEcoScore())
                        .rank((int) rank)
                        .level(p.getCurrentLevel())
                        .profilePictureUrl(profilePic)
                        .build());
            }
            return new org.springframework.data.domain.PageImpl<>(dtos, pageable, page.getTotalElements());
            
        } else {
            if (period == com.ecotrack.leaderboard.enums.LeaderboardPeriod.ALL_TIME) {
                var page = profileRepository.findAllByOrderByLifetimeEcoXpDesc(pageable);
                List<LeaderboardEntryDTO> dtos = new java.util.ArrayList<>();
                List<Long> userIds = page.getContent().stream().map(p -> p.getUserId()).collect(Collectors.toList());
                Map<Long, String> userNames = userRepository.findAllById(userIds).stream()
                        .collect(Collectors.toMap(User::getId, User::getName));
                        
                for (var p : page.getContent()) {
                    long rank = profileRepository.countDistinctByLifetimeEcoXpGreaterThan(p.getLifetimeEcoXp()) + 1;
                    var userProfileOpt = userProfileRepository.findByUser_Id(p.getUserId());
                    String profilePic = userProfileOpt.isPresent() ? userProfileOpt.get().getProfilePictureUrl() : null;
                    
                    dtos.add(LeaderboardEntryDTO.builder()
                            .userId(p.getUserId())
                            .username(userNames.getOrDefault(p.getUserId(), "User " + p.getUserId()))
                            .scoreValue(p.getLifetimeEcoXp())
                            .rank((int) rank)
                            .level(p.getCurrentLevel())
                            .profilePictureUrl(profilePic)
                            .build());
                }
                return new org.springframework.data.domain.PageImpl<>(dtos, pageable, page.getTotalElements());
            } else {
                java.time.LocalDateTime startDate = period == com.ecotrack.leaderboard.enums.LeaderboardPeriod.MONTHLY ? 
                        java.time.LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0) :
                        java.time.LocalDateTime.now().minusDays(7);
                        
                var rows = xpLedgerRepository.findTopUsersByXpSince(startDate, pageable);
                
                List<LeaderboardEntryDTO> dtos = new java.util.ArrayList<>();
                int currentRank = (int) pageable.getOffset() + 1;
                long previousXp = -1;
                int tieCount = 0;
                
                List<Long> userIds = rows.stream().map(row -> (Long) row[0]).collect(Collectors.toList());
                Map<Long, com.ecotrack.gamification.entity.UserGamificationProfile> profiles = profileRepository.findAllById(userIds).stream()
                        .collect(Collectors.toMap(com.ecotrack.gamification.entity.UserGamificationProfile::getUserId, p -> p));

                for (int i = 0; i < rows.size(); i++) {
                    Object[] row = rows.get(i);
                    long currentXp = ((Number) row[2]).longValue();
                    Long uId = (Long) row[0];
                    var p = profiles.get(uId);
                    int level = p != null ? p.getCurrentLevel() : 1;
                    
                    if (previousXp == -1 || currentXp < previousXp) {
                        currentRank += tieCount;
                        tieCount = 1;
                        previousXp = currentXp;
                        if (i == 0) currentRank = (int) pageable.getOffset() + 1; 
                    } else {
                        tieCount++;
                    }

                    var userProfileOpt = userProfileRepository.findByUser_Id(uId);
                    String profilePic = userProfileOpt.isPresent() ? userProfileOpt.get().getProfilePictureUrl() : null;

                    dtos.add(LeaderboardEntryDTO.builder()
                            .userId(uId)
                            .username((String) row[1])
                            .scoreValue(currentXp)
                            .rank(currentRank)
                            .level(level)
                            .profilePictureUrl(profilePic)
                            .build());
                }
                long total = rows.size() == pageable.getPageSize() ? pageable.getOffset() + rows.size() + 1 : pageable.getOffset() + rows.size();
                return new org.springframework.data.domain.PageImpl<>(dtos, pageable, total);
            }
        }
    }

    public org.springframework.data.domain.Page<LeaderboardEntryDTO> getChallengeLeaderboard(Long challengeId, Long userId, org.springframework.data.domain.Pageable pageable) {
        var challengeOpt = challengeRepository.findById(challengeId);
        if (challengeOpt.isEmpty()) {
            throw new IllegalArgumentException("Challenge not found");
        }
        var challenge = challengeOpt.get();
        
        var userParticipant = challengeParticipantRepository.findByChallengeIdAndUserId(challengeId, userId);
        if (userParticipant.isEmpty()) {
            throw new org.springframework.security.access.AccessDeniedException("User has not joined this challenge");
        }
        
        var allParticipants = challengeParticipantRepository.findByChallengeId(challengeId);
        boolean isBudget = challenge.getChallengeEvaluationType() == com.ecotrack.challenge.enums.ChallengeEvaluationType.BUDGET;
        
        double currentBudget = 0;
        if (isBudget) {
            long start = challenge.getStartDate().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli();
            long end = challenge.getEndDate().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli();
            long now = System.currentTimeMillis();
            long totalDays = Math.max(1, (long) Math.ceil((end - start) / (1000.0 * 60 * 60 * 24)));
            long currentDays = Math.max(1, (long) Math.ceil((now - start) / (1000.0 * 60 * 60 * 24)));
            if (currentDays > totalDays) currentDays = totalDays;
            double dailyAvg = challenge.getTargetValue() / (double) totalDays;
            currentBudget = dailyAvg * currentDays;
        }
        
        final double budgetVal = currentBudget;
        
        allParticipants.sort((a, b) -> {
            if (isBudget) {
                boolean aFailed = a.getStatus() == com.ecotrack.challenge.enums.ChallengeParticipantStatus.FAILED || a.getStatus() == com.ecotrack.challenge.enums.ChallengeParticipantStatus.DROPPED || a.getProgress().doubleValue() > budgetVal;
                boolean bFailed = b.getStatus() == com.ecotrack.challenge.enums.ChallengeParticipantStatus.FAILED || b.getStatus() == com.ecotrack.challenge.enums.ChallengeParticipantStatus.DROPPED || b.getProgress().doubleValue() > budgetVal;
                if (aFailed != bFailed) {
                    return aFailed ? 1 : -1;
                }
                return a.getProgress().compareTo(b.getProgress());
            } else {
                boolean aCompleted = a.getStatus() == com.ecotrack.challenge.enums.ChallengeParticipantStatus.COMPLETED;
                boolean bCompleted = b.getStatus() == com.ecotrack.challenge.enums.ChallengeParticipantStatus.COMPLETED;
                if (aCompleted && !bCompleted) return -1;
                if (!aCompleted && bCompleted) return 1;
                if (aCompleted && bCompleted) {
                    long dateA = a.getCompletedAt() != null ? a.getCompletedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli() : 0;
                    long dateB = b.getCompletedAt() != null ? b.getCompletedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli() : 0;
                    return Long.compare(dateA, dateB);
                }
                return b.getProgress().compareTo(a.getProgress());
            }
        });
        
        List<LeaderboardEntryDTO> dtos = new java.util.ArrayList<>();
        int rank = 1;
        
        List<Long> userIds = allParticipants.stream().map(p -> p.getUserId()).collect(Collectors.toList());
        Map<Long, String> userNames = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, User::getName));
        Map<Long, com.ecotrack.gamification.entity.UserGamificationProfile> profiles = profileRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(com.ecotrack.gamification.entity.UserGamificationProfile::getUserId, p -> p));
                
        for (int i = 0; i < allParticipants.size(); i++) {
            var p = allParticipants.get(i);
            
            if (i > 0) {
                var prev = allParticipants.get(i - 1);
                boolean isTie = false;
                if (isBudget) {
                    boolean aFailed = p.getStatus() == com.ecotrack.challenge.enums.ChallengeParticipantStatus.FAILED || p.getStatus() == com.ecotrack.challenge.enums.ChallengeParticipantStatus.DROPPED || p.getProgress().doubleValue() > budgetVal;
                    boolean bFailed = prev.getStatus() == com.ecotrack.challenge.enums.ChallengeParticipantStatus.FAILED || prev.getStatus() == com.ecotrack.challenge.enums.ChallengeParticipantStatus.DROPPED || prev.getProgress().doubleValue() > budgetVal;
                    if (aFailed == bFailed && p.getProgress().compareTo(prev.getProgress()) == 0) {
                        isTie = true;
                    }
                } else {
                    boolean aCompleted = p.getStatus() == com.ecotrack.challenge.enums.ChallengeParticipantStatus.COMPLETED;
                    boolean bCompleted = prev.getStatus() == com.ecotrack.challenge.enums.ChallengeParticipantStatus.COMPLETED;
                    if (aCompleted == bCompleted) {
                        if (aCompleted) {
                            long dateA = p.getCompletedAt() != null ? p.getCompletedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli() : 0;
                            long dateB = prev.getCompletedAt() != null ? prev.getCompletedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli() : 0;
                            if (dateA == dateB && p.getProgress().compareTo(prev.getProgress()) == 0) isTie = true;
                        } else {
                            if (p.getProgress().compareTo(prev.getProgress()) == 0) isTie = true;
                        }
                    }
                }
                if (!isTie) {
                    rank = i + 1;
                }
            }
            
            var profile = profiles.get(p.getUserId());
            
            var userProfileOpt = userProfileRepository.findByUser_Id(p.getUserId());
            String profilePic = userProfileOpt.isPresent() ? userProfileOpt.get().getProfilePictureUrl() : null;
            
            dtos.add(LeaderboardEntryDTO.builder()
                    .userId(p.getUserId())
                    .username(userNames.getOrDefault(p.getUserId(), "User " + p.getUserId()))
                    .metricValue(p.getProgress())
                    .rank(rank)
                    .level(profile != null ? profile.getCurrentLevel() : 1)
                    .status(p.getStatus().name())
                    .completedAt(p.getCompletedAt())
                    .profilePictureUrl(profilePic)
                    .build());
        }
        
        int start = pageable.isUnpaged() ? 0 : (int) pageable.getOffset();
        int end = pageable.isUnpaged() ? dtos.size() : Math.min((start + pageable.getPageSize()), dtos.size());
        List<LeaderboardEntryDTO> pageList = start <= end ? dtos.subList(start, end) : new java.util.ArrayList<>();
        
        return new org.springframework.data.domain.PageImpl<>(pageList, pageable, dtos.size());
    }

    public LeaderboardEntryDTO getMyChallengeRank(Long challengeId, Long userId) {
        org.springframework.data.domain.Pageable unpaged = org.springframework.data.domain.Pageable.unpaged();
        org.springframework.data.domain.Page<LeaderboardEntryDTO> allRankings = getChallengeLeaderboard(challengeId, userId, unpaged);
        return allRankings.getContent().stream()
                .filter(dto -> dto.getUserId().equals(userId))
                .findFirst()
                .orElse(null);
    }
}
