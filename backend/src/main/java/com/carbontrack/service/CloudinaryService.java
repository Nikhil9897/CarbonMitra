package com.carbontrack.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(@org.springframework.beans.factory.annotation.Autowired(required = false) Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String uploadImage(String base64Image) {
        if (cloudinary == null) {
            log.warn("Cloudinary is not configured. Returning local image representation.");
            return base64Image;
        }

        try {
            // Cloudinary SDK supports direct data URL upload (e.g. data:image/jpeg;base64,...)
            Map<?, ?> uploadResult = cloudinary.uploader().upload(base64Image, ObjectUtils.emptyMap());
            String secureUrl = (String) uploadResult.get("secure_url");
            log.info("Successfully uploaded image to Cloudinary: {}", secureUrl);
            return secureUrl;
        } catch (Exception e) {
            log.error("Failed to upload image to Cloudinary: {}", e.getMessage(), e);
            throw new RuntimeException("Cloudinary upload failed", e);
        }
    }
}
