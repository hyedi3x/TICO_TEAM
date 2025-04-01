package com.boot.tico.login.dto;

import lombok.Getter;
import lombok.Setter;

/*
  UserDto 클래스는 일반 회원가입과 소셜 회원가입 모두에서 사용되고,
  소셜 가입 시 추가적으로 provider와 providerId 필드를 전달함
*/
public class UserDto {
    @Getter
    @Setter
    public static class Request {
        private String email;
        private String password; // 일반 가입 시 필요, 소셜 가입은 null
        private String phone;
        private String name;
        private String nickname;
        // 소셜 가입 시 사용 (local이 아니면 소셜 가입)
        private String provider;
        private String providerId;
    }

    @Getter
    @Setter
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Getter
    @Setter
    public static class Response {
        private String id;
        private String email;
        private String name;
        private String nickname;
        private String phone;
        private String provider;
        private String accessToken;
        private String refreshToken;
    }
}
