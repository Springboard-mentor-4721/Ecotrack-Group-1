package com.ecotrack.admin.service;

import com.ecotrack.admin.dto.response.AdminDashboardResponse;
import com.ecotrack.admin.dto.response.UserDetailResponse;
import com.ecotrack.admin.dto.response.UserSummaryResponse;
import com.ecotrack.admin.mapper.AdminUserMapper;
import com.ecotrack.common.enums.Status;
import com.ecotrack.user.entity.User;
import com.ecotrack.user.entity.UserProfile;
import com.ecotrack.user.repository.UserProfileRepository;
import com.ecotrack.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final AdminUserMapper adminUserMapper;
    private final com.ecotrack.challenge.repository.ChallengeRepository challengeRepository;

    @Transactional(readOnly = true)
    public Page<UserSummaryResponse> getUsers(Pageable pageable, String search) {
        Page<User> users;
        if (search != null && !search.trim().isEmpty()) {
            users = userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(search, search, pageable);
        } else {
            users = userRepository.findAll(pageable);
        }
        return users.map(user -> {
            UserProfile profile = userProfileRepository.findByUser_Id(user.getId()).orElse(null);
            return adminUserMapper.toSummaryResponse(user, profile);
        });
    }

    @Transactional(readOnly = true)
    public UserDetailResponse getUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        UserProfile profile = userProfileRepository.findByUser_Id(id).orElse(null);
        
        return adminUserMapper.toDetailResponse(user, profile);
    }

    @Transactional
    public UserDetailResponse updateUserStatus(Long adminId, Long targetUserId, Status status) {
        if (adminId.equals(targetUserId)) {
            throw new IllegalArgumentException("Administrators cannot suspend their own account.");
        }

        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        user.setStatus(status);
        userRepository.save(user);
        
        UserProfile profile = userProfileRepository.findByUser_Id(targetUserId).orElse(null);
        return adminUserMapper.toDetailResponse(user, profile);
    }

    @Transactional
    public UserDetailResponse updateUserRole(Long adminId, Long targetUserId, com.ecotrack.common.enums.Role newRole) {
        if (adminId.equals(targetUserId)) {
            throw new IllegalArgumentException("Cannot modify own role");
        }

        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (newRole == com.ecotrack.common.enums.Role.USER && userRepository.countByRole(com.ecotrack.common.enums.Role.ADMIN) <= 1) {
            throw new IllegalArgumentException("Cannot demote last admin");
        }

        user.setRole(newRole);
        userRepository.save(user);

        UserProfile profile = userProfileRepository.findByUser_Id(targetUserId).orElse(null);
        return adminUserMapper.toDetailResponse(user, profile);
    }

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboardSummary() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByStatus(Status.ACTIVE);
        long suspendedUsers = userRepository.countByStatus(Status.SUSPENDED);
        long adminUsers = userRepository.countByRole(com.ecotrack.common.enums.Role.ADMIN);
        long totalParticipants = userRepository.countByRole(com.ecotrack.common.enums.Role.USER);

        return AdminDashboardResponse.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .suspendedUsers(suspendedUsers)
                .adminUsers(adminUsers)
                .totalParticipants(totalParticipants)
                .build();
    }

    @Transactional(readOnly = true)
    public com.ecotrack.admin.dto.response.AdminDashboardPulseDTO getDashboardPulse() {
        long totalUsers = userRepository.count();
        long activeChallenges = challengeRepository.countByStatus(com.ecotrack.challenge.enums.ChallengeStatus.ACTIVE);
        long upcomingChallenges = challengeRepository.countByStatus(com.ecotrack.challenge.enums.ChallengeStatus.UPCOMING);
        long completedChallenges = challengeRepository.countByStatus(com.ecotrack.challenge.enums.ChallengeStatus.COMPLETED);

        return com.ecotrack.admin.dto.response.AdminDashboardPulseDTO.builder()
                .totalUsers(totalUsers)
                .activeChallengesCount(activeChallenges)
                .upcomingChallengesCount(upcomingChallenges)
                .completedChallengesCount(completedChallenges)
                .build();
    }
}
