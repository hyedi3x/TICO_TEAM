package com.boot.tico.login.security;

import java.time.LocalDate;
import java.util.Map;

public class OAuth2Utils {
    // ✅ 소셜 제공자로부터 이메일 추출
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

    // ✅ 소셜 제공자로부터 providerId 추출
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

    // ✅ 소셜 제공자로부터 사용자 이름 추출
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
    
    // ✅ 소셜 제공자로부터 전화번호 추출
    public static String extractPhone(String provider, Map<String, Object> attributes) {
        if ("naver".equals(provider)) {
            Map<String, Object> res = (Map<String, Object>) attributes.get("response");
            return res != null ? (String) res.get("mobile") : null;      // 네이버 mobile 필드
        } else if ("kakao".equals(provider)) {
            Map<String, Object> acct = (Map<String, Object>) attributes.get("kakao_account");
            return acct != null ? (String) acct.get("phone_number") : null;
        }
        return null;  // 구글 기본 API에는 전화번호 없음
    }
    
 
    // ✅ 소셜 제공자로부터 닉네임(별명) 기본값 추출
    public static String extractNickname(String provider, Map<String, Object> attributes) {
        if ("kakao".equals(provider)) {
            Map<String, Object> props = (Map<String, Object>) attributes.get("properties");
            return props != null ? (String) props.get("nickname") : null;
        } else if ("naver".equals(provider)) {
            Map<String, Object> res = (Map<String, Object>) attributes.get("response");
            return res != null ? (String) res.get("nickname") : null;
        }
        return null;  // 구글 기본 API에는 nickname 없음
    }
    
    // ✅ 소셜 제공자로부터 생년월일 추출
    public static LocalDate extractBirthDate(String provider, Map<String, Object> attributes) {
        try {
            if ("naver".equals(provider)) {
                Map<String, Object> res = (Map<String, Object>) attributes.get("response");
                String year = (String) res.get("birthyear");
                String day = (String) res.get("birthday"); // "MM-DD"
                if (year != null && day != null) {
                    return LocalDate.parse(year + "-" + day); // "1997-12-07"
                }
            } else if ("kakao".equals(provider)) {
                Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
                String year = (String) kakaoAccount.get("birthyear");
                String day = (String) kakaoAccount.get("birthday"); // "MMdd"
                if (year != null && day != null && day.length() == 4) {
                    return LocalDate.parse(year + "-" + day.substring(0, 2) + "-" + day.substring(2, 4));
                }
            } else if ("google".equals(provider)) {
                // 구글은 기본 API에서 생년월일을 제공하지 않음
                // 별도 People API 사용하지 않는 이상 null 처리
                return null;
            }
        } catch (Exception e) {
            System.out.println("⚠️ BirthDate 파싱 실패: " + e.getMessage());
        }
        return null;
    }
    
}
