package com.boot.tico.login.security;

import com.boot.tico.login.entity.User;
import com.boot.tico.login.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.Optional;
import static java.nio.charset.StandardCharsets.UTF_8;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserService    userService;
    private final JwtTokenizer   jwtTokenizer;
    private final Environment    environment;

    @Value("${frontend.redirect-url}")
    private String redirectUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        log.info("OAuth2SuccessHandler 도달");

        OAuth2AuthenticationToken authToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oAuth2User = authToken.getPrincipal();

        // 🔥 네이버 응답 정보 로그 추가
        Map<String, Object> attributes = oAuth2User.getAttributes();
        log.info("소셜 로그인 응답 attributes: {}", attributes); // 👈 이 줄 추가
        
        String provider   = authToken.getAuthorizedClientRegistrationId();
        String email      = OAuth2Utils.extractEmail(provider,   oAuth2User.getAttributes());
        String providerId = OAuth2Utils.extractProviderId(provider, oAuth2User.getAttributes());
        String name       = OAuth2Utils.extractName(provider,     oAuth2User.getAttributes());

        log.info("추출된 Email: {}",      email);
        log.info("추출된 ProviderId: {}", providerId);

        Optional<User> optionalUser = userService.findOAuth2User(email, provider);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            

            // JWT Claims 및 토큰 생성
            Map<String, Object> claims = Map.of(
                "email",     user.getEmail(),
                "user_uuid", user.getUser_uuid()
            );
            String accessToken  = jwtTokenizer.generateAccessToken(claims);
            String refreshToken = jwtTokenizer.generateRefreshToken(claims);

            // DB에 refresh token 및 만료일시 저장
            long expiryMs = Long.parseLong(
                environment.getProperty("jwt.refresh-token-expiration")
            );
            user.setRefreshToken(refreshToken);
            user.setRefreshTokenExpiry(
                LocalDateTime.now().plus(expiryMs, ChronoUnit.MILLIS)
            );
            userService.saveUser(user);

            // HttpOnly Secure 쿠키에 refresh token 세팅
            ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false)      // HTTP 환경이므로 false
                .sameSite("None")   // cross-site 허용
                .path("/")
                .maxAge(expiryMs / 1000)       // 초 단위
                .sameSite("Strict")            // 크로스 사이트 환경에서는 "None"으로 설정 필요
                .build();
            response.setHeader(HttpHeaders.SET_COOKIE, cookie.toString());

            // 리다이렉트 URL (쿼리엔 accessToken과 user_uuid 만)
            String redirectFullUrl = redirectUrl
                + "?accessToken=" + URLEncoder.encode(accessToken, StandardCharsets.UTF_8.toString())
                + "&user_uuid="   + URLEncoder.encode(user.getUser_uuid(), StandardCharsets.UTF_8.toString());
            log.info("리다이렉트 URL: {}", redirectFullUrl);

            getRedirectStrategy().sendRedirect(request, response, redirectFullUrl);
        } else {
            // ✅ 신규 소셜 사용자: DB 저장 제거하고, 받는 정보만 쿼리로 전달하도록 변경
            LocalDate birthDate = OAuth2Utils.extractBirthDate(provider, attributes);
            String birthDateStr = birthDate != null ? birthDate.toString() : ""; 

            String phone    = OAuth2Utils.extractPhone(provider, attributes);        
            String nickname = OAuth2Utils.extractNickname(provider, attributes);     

            String signupUrl = redirectUrl.replace("/callback", "/social-signup")
                + "?email="      + URLEncoder.encode(email, UTF_8)
                + "&provider="   + URLEncoder.encode(provider, UTF_8)
                + "&providerId=" + URLEncoder.encode(providerId,UTF_8)
                + "&name="       + URLEncoder.encode(name, UTF_8)
                + "&birthDate="  + URLEncoder.encode(birthDateStr, UTF_8)   
                + "&phone="      + URLEncoder.encode(phone != null ? phone : "", UTF_8)   
                + "&nickname="   + URLEncoder.encode(nickname != null ? nickname : "", UTF_8); 

            log.info("신규 소셜 사용자 리다이렉트 URL: {}", signupUrl);
            getRedirectStrategy().sendRedirect(request, response, signupUrl);
        }
    }
}
