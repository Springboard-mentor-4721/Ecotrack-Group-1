package com.ecotrack.security.oauth2;

import com.ecotrack.auth.dto.GoogleUserInfo;
import com.ecotrack.auth.service.OAuth2Service;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final OAuth2Service oauth2Service;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public OAuth2LoginSuccessHandler(OAuth2Service oauth2Service) {
        this.oauth2Service = oauth2Service;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String googleId = oAuth2User.getAttribute("sub");
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        Boolean emailVerifiedObj = oAuth2User.getAttribute("email_verified");
        boolean emailVerified = emailVerifiedObj != null && emailVerifiedObj;

        GoogleUserInfo userInfo = new GoogleUserInfo(googleId, email, name, emailVerified);

        String jwtToken = oauth2Service.processOAuth2User(userInfo);

        String redirectUrl = frontendUrl + "/oauth2/success?token=" + jwtToken;
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
