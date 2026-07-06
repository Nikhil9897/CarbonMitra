package com.carbontrack.listener;

import com.carbontrack.entity.User;
import com.carbontrack.event.PhotoUploadedEvent;
import com.carbontrack.repository.UserRepository;
import com.carbontrack.service.CloudinaryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Slf4j
public class PhotoUploadedListener {

    private final CloudinaryService cloudinaryService;
    private final UserRepository userRepository;

    public PhotoUploadedListener(CloudinaryService cloudinaryService, UserRepository userRepository) {
        this.cloudinaryService = cloudinaryService;
        this.userRepository = userRepository;
    }

    @Async("cloudinaryExecutor")
    @EventListener
    @Transactional
    public void handlePhotoUploaded(PhotoUploadedEvent event) {
        log.info("PhotoUploadedListener: Starting background Cloudinary upload for User ID {}", event.getUserId());
        try {
            String secureUrl = cloudinaryService.uploadImage(event.getBase64Image());
            User user = userRepository.findById(event.getUserId()).orElse(null);
            if (user != null) {
                user.setProfilePicture(secureUrl);
                userRepository.save(user);
                log.info("PhotoUploadedListener: Successfully updated profile picture to Cloudinary secure URL for User ID {}", event.getUserId());
            }
        } catch (Exception e) {
            log.error("PhotoUploadedListener: Failed to upload user profile photo to Cloudinary: {}", e.getMessage(), e);
        }
    }
}
