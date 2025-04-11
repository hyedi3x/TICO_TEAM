package com.boot.tico.login.security;

import com.boot.tico.login.entity.User;
import com.boot.tico.login.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserService userService;
    private final JwtTokenizer jwtTokenizer;

    @Value("${frontend.redirect-url}")
    private String redirectUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        
        log.info("OAuth2SuccessHandler 도달");
        
        OAuth2AuthenticationToken authToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String provider = authToken.getAuthorizedClientRegistrationId();
        log.info("OAuth2 Provider: {}", provider);
        log.info("OAuth2 User Attributes: {}", oAuth2User.getAttributes());

        String email = OAuth2Utils.extractEmail(provider, oAuth2User.getAttributes());
        String providerId = OAuth2Utils.extractProviderId(provider, oAuth2User.getAttributes());
        String name = OAuth2Utils.extractName(provider, oAuth2User.getAttributes());

        log.info("추출된 Email: {}", email);
        log.info("추출된 ProviderId: {}", providerId);

        Optional<User> optionalUser = userService.findOAuth2User(email, provider);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            Map<String, Object> claims = Map.of("email", user.getEmail(), "user_uuid", user.getUser_uuid());
            String accessToken = jwtTokenizer.generateAccessToken(claims);
            String refreshToken = jwtTokenizer.generateRefreshToken(claims);
    
            String redirectFullUrl = redirectUrl + "?accessToken=" + accessToken + "&refreshToken=" + refreshToken + "&user_uuid=" + user.getUser_uuid();
            log.info("리다이렉트 URL: {}", redirectFullUrl);
            getRedirectStrategy().sendRedirect(request, response, redirectFullUrl);
        } else {
            String socialSignupUrl = redirectUrl.replace("/callback", "/social-signup") +
                    "?email=" + URLEncoder.encode(email, StandardCharsets.UTF_8.toString()) +
                    "&provider=" + URLEncoder.encode(provider, StandardCharsets.UTF_8.toString()) +
                    "&providerId=" + URLEncoder.encode(providerId, StandardCharsets.UTF_8.toString()) +
                    "&name=" + URLEncoder.encode(name, StandardCharsets.UTF_8.toString());
            log.info("신규 소셜 사용자 리다이렉트 URL: {}", socialSignupUrl);
            getRedirectStrategy().sendRedirect(request, response, socialSignupUrl);
        }
    }
}
