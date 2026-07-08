package com.carbontrack.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.util.Arrays;
import java.util.List;

@Component
@Slf4j
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider tokenProvider;

    /**
     * Authorized redirect URIs injected as a comma-separated string and split into a list.
     * Previously injected directly as List<String> which caused Spring to treat the full
     * comma-separated value as a single list element.
     */
    private final List<String> authorizedRedirectUris;

    public OAuth2AuthenticationSuccessHandler(
            JwtTokenProvider tokenProvider,
            @Value("${app.oauth2.authorized-redirect-uris}") String authorizedRedirectUrisStr) {
        this.tokenProvider = tokenProvider;
        this.authorizedRedirectUris = Arrays.asList(authorizedRedirectUrisStr.split(","));
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        String targetUrl = determineTargetUrl(request, response, authentication);

        if (response.isCommitted()) {
            log.debug("Response already committed. Unable to redirect to {}", targetUrl);
            return;
        }

        clearAuthenticationAttributes(request);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    @Override
    protected String determineTargetUrl(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) {
        String redirectUri = request.getParameter("redirect_uri");

        if (redirectUri != null && !isAuthorizedRedirectUri(redirectUri)) {
            throw new IllegalArgumentException(
                    "Unauthorized redirect URI. Cannot proceed with OAuth2 authentication.");
        }

        String targetUrl = (redirectUri != null) ? redirectUri.trim() : authorizedRedirectUris.get(0).trim();

        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);

        log.info("OAuth2 login success. Redirecting to: {}", targetUrl);

        return UriComponentsBuilder.fromUriString(targetUrl)
                .queryParam("token", accessToken)
                .queryParam("refresh_token", refreshToken)
                .build().toUriString();
    }

    private boolean isAuthorizedRedirectUri(String uri) {
        URI clientRedirectUri;
        try {
            clientRedirectUri = URI.create(uri.trim());
        } catch (IllegalArgumentException e) {
            log.warn("Invalid redirect URI: {}", uri);
            return false;
        }

        return authorizedRedirectUris.stream()
                .anyMatch(authorizedRedirectUri -> {
                    try {
                        URI authorizedURI = URI.create(authorizedRedirectUri.trim());
                        // Match by host and port only (path is allowed to differ)
                        return authorizedURI.getHost().equalsIgnoreCase(clientRedirectUri.getHost())
                                && authorizedURI.getPort() == clientRedirectUri.getPort();
                    } catch (Exception e) {
                        log.warn("Malformed authorized redirect URI in config: {}", authorizedRedirectUri);
                        return false;
                    }
                });
    }
}
