package com.ecotrack.user.service;

import com.ecotrack.user.entity.User;
import com.ecotrack.user.entity.UserProfile;
import com.ecotrack.user.repository.UserProfileRepository;
import com.ecotrack.user.repository.UserRepository;
import com.ecotrack.user.util.FileUploadUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    
    private final String UPLOAD_DIR = "uploads/profile-images/";

    @Transactional
    public String uploadAvatar(Long userId, MultipartFile file) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        UserProfile userProfile = userProfileRepository.findByUser_Id(userId)
                .orElseGet(() -> {
                    UserProfile newProfile = new UserProfile();
                    newProfile.setUser(user);
                    return userProfileRepository.save(newProfile);
                });

        String fileName = FileUploadUtil.saveProfileImage(file, UPLOAD_DIR, userId);
        String imagePath = UPLOAD_DIR + fileName;

        userProfile.setProfilePictureUrl(imagePath);
        userProfileRepository.save(userProfile);

        return imagePath;
    }

    @Transactional
    public void deleteAvatar(Long userId) {
        UserProfile userProfile = userProfileRepository.findByUser_Id(userId)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));
        
        // Also physically delete the file if it exists
        if (userProfile.getProfilePictureUrl() != null) {
            try {
                java.nio.file.Files.deleteIfExists(java.nio.file.Paths.get(userProfile.getProfilePictureUrl()));
            } catch (IOException e) {
                // Log and ignore
            }
        }

        userProfile.setProfilePictureUrl(null);
        userProfileRepository.save(userProfile);
    }
}
