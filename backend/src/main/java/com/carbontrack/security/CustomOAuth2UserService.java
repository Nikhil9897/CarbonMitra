package com.carbontrack.security;

import com.carbontrack.entity.AuthProvider;
import com.carbontrack.entity.Role;
import com.carbontrack.entity.User;
import com.carbontrack.exception.OAuth2AuthenticationProcessingException;
import com.carbontrack.repository.UserRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.carbontrack.event.UserRegisteredEvent;
import java.util.Map;
import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    public CustomOAuth2UserService(UserRepository userRepository, ApplicationEventPublisher eventPublisher) {
        this.userRepository = userRepository;
        this.eventPublisher = eventPublisher;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest oAuth2UserRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(oAuth2UserRequest);
        try {
            return processOAuth2User(oAuth2UserRequest, oAuth2User);
        } catch (Exception ex) {
            throw new OAuth2AuthenticationException(ex.getMessage());
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest oAuth2UserRequest, OAuth2User oAuth2User) {
        Map<String, Object> attributes = oAuth2User.getAttributes();
        String email = (String) attributes.get("email");
        if (!StringUtils.hasText(email)) {
            throw new OAuth2AuthenticationProcessingException("Email not found from OAuth2 provider");
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            if (!user.getProvider().equals(AuthProvider.GOOGLE)) {
                throw new OAuth2AuthenticationProcessingException("Looks like you are signed up with " +
                        user.getProvider() + " account. Please use your normal login mechanism.");
            }
            user = updateExistingUser(user, attributes);
        } else {
            user = registerNewUser(oAuth2UserRequest, attributes);
        }

        return UserPrincipal.create(user, attributes);
    }

    private User registerNewUser(OAuth2UserRequest oAuth2UserRequest, Map<String, Object> attributes) {
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        
        // Generate unique username from name or email prefix
        String username = name != null ? name.replaceAll("\\s+", "").toLowerCase() : email.split("@")[0];
        if (userRepository.existsByUsername(username)) {
            username = username + "_" + System.currentTimeMillis() % 1000;
        }

        User user = User.builder()
                .email(email)
                .username(username)
                .provider(AuthProvider.GOOGLE)
                .role(Role.ROLE_USER)
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);
        eventPublisher.publishEvent(new UserRegisteredEvent(this, savedUser));
        return savedUser;
    }

    private User updateExistingUser(User existingUser, Map<String, Object> attributes) {
        String name = (String) attributes.get("name");
        if (name != null && !name.equals(existingUser.getUsername()) && !userRepository.existsByUsername(name)) {
            existingUser.setUsername(name.replaceAll("\\s+", "").toLowerCase());
        }
        return userRepository.save(existingUser);
    }
}
