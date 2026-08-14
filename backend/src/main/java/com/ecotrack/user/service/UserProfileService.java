package com.ecotrack.user.service;

import com.ecotrack.goal.entity.enums.GoalType;
import com.ecotrack.user.dto.request.UpdateUserProfileRequest;
import com.ecotrack.user.dto.response.UserProfileResponse;
import com.ecotrack.user.entity.User;
import com.ecotrack.user.entity.UserInterest;
import com.ecotrack.user.entity.UserProfile;
import com.ecotrack.user.exception.UserProfileNotFoundException;
import com.ecotrack.user.mapper.UserProfileMapper;
import com.ecotrack.user.repository.UserInterestRepository;
import com.ecotrack.user.repository.UserProfileRepository;
import com.ecotrack.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserInterestRepository userInterestRepository;
    private final UserProfileMapper userProfileMapper;

    @Transactional
    public UserProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        UserProfile userProfile = userProfileRepository.findByUser_Id(userId)
                .orElseGet(() -> {
                    UserProfile newProfile = new UserProfile();
                    newProfile.setUser(user);
                    return userProfileRepository.save(newProfile);
                });

        List<String> interests = userInterestRepository.findByUser_Id(userId)
                .stream().map(UserInterest::getInterestCategory).toList();

        return userProfileMapper.toResponse(user, userProfile, interests);
    }

    @Transactional
    public UserProfileResponse updateProfile(Long userId, UpdateUserProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        UserProfile userProfile = userProfileRepository.findByUser_Id(userId)
                .orElseGet(() -> {
                    UserProfile newProfile = new UserProfile();
                    newProfile.setUser(user);
                    return userProfileRepository.save(newProfile);
                });

        if (request.getBio() != null) {
            userProfile.setBio(request.getBio());
        }
        if (request.getLocation() != null) {
            userProfile.setLocation(request.getLocation());
        }
        if (request.getLifestylePreferences() != null) {
            userProfile.setLifestylePreferences(request.getLifestylePreferences());
        }
        if (request.getFcmToken() != null) {
            userProfile.setFcmToken(request.getFcmToken());
        }

        userProfileRepository.save(userProfile);

        if (request.getInterests() != null) {
            userInterestRepository.deleteByUser_Id(userId);
            List<UserInterest> newInterests = request.getInterests().stream()
                .map(interest -> {
                    UserInterest ui = new UserInterest();
                    ui.setUser(user);
                    ui.setInterestCategory(interest);
                    return ui;
                }).collect(Collectors.toList());
            userInterestRepository.saveAll(newInterests);
        }

        List<String> interests = userInterestRepository.findByUser_Id(userId)
                .stream().map(UserInterest::getInterestCategory).toList();

        return userProfileMapper.toResponse(user, userProfile, interests);
    }

}
