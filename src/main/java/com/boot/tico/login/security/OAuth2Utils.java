package com.boot.tico.login.security;

import java.util.Map;

public class OAuth2Utils {
    // 각 소셜 제공자로부터 이메일 추출
    public static String extractEmail(String provider, Map<String, Object> attributes) {
        switch (provider) {
            case "kakao":
                Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
                return kakaoAccount != null ? (String) kakaoAccount.get("email") : "unknown@kakao.com";
            case "naver":
                Map<String, Object> response = (Map<String, Object>) attributes.get("response");
                return response != null ? (String) response.get("email") : "unknown@naver.com";
            default:
                return (String) attributes.getOrDefault("email", "unknown@google.com");
        }
    }

    // 각 소셜 제공자로부터 providerId 추출
    public static String extractProviderId(String provider, Map<String, Object> attributes) {
        switch (provider) {
            case "kakao":
                return String.valueOf(attributes.get("id"));
            case "naver":
                Map<String, Object> response = (Map<String, Object>) attributes.get("response");
                return String.valueOf(response.get("id"));
            default:
                return (String) attributes.get("sub");
        }
    }

    // 각 소셜 제공자로부터 사용자 이름 추출
    public static String extractName(String provider, Map<String, Object> attributes) {
        switch (provider) {
            case "google":
                return (String) attributes.get("name");
            case "kakao":
                Map<String, Object> properties = (Map<String, Object>) attributes.get("properties");
                return properties != null ? (String) properties.get("nickname") : "";
            case "naver":
                Map<String, Object> response = (Map<String, Object>) attributes.get("response");
                return response != null ? (String) response.get("name") : "";
            default:
                return "";
        }
    }
}
