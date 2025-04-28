package com.boot.tico.login.dto;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Getter;
import lombok.Setter;

public class UserDto {

    // ✅ 회원가입/수정 요청 DTO
    @Getter
    @Setter
    public static class Request {
        private String email;       // 사용자 이메일
        private String password;    // 사용자 비밀번호
        private String name;        // 이름
        private String nickname;    // 닉네임
        
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        private LocalDate birthDate;// 생년월일
        private String phone;       // 연락처
        private String provider;    // 소셜 로그인 공급자 (google, kakao 등)
        private String providerId;  // 소셜 로그인 고유 ID
        private String verificationCode;  // 이메일 인증 코드
    }

    // ✅ 로그인 요청 DTO
    @Getter
    @Setter
    public static class LoginRequest {
        private String email;       // 일반 로그인 시 이메일
        private String password;    // 일반 로그인 시 비밀번호
    }

    // ✅ 응답 DTO (공통으로 사용)
    @Getter
    @Setter
    public static class Response {
        private String user_uuid;      // 유저 고유 식별자 (또는 empId)
        private String email;          // 이메일
        private String name;           // 이름
        private String nickname;       // 닉네임
        private LocalDate birthDate;   // 생년월일
        private String phone;          // 전화번호
        private String provider;       // 로그인 방식 구분자 (local, naver, kakao 등)
        private String accessToken;    // JWT Access Token
    }
}
