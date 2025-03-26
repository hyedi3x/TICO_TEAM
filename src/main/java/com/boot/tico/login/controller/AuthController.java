package com.boot.tico.login.controller;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.boot.tico.login.entity.User;
import com.boot.tico.login.service.KakaoLoginService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
// @CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
// config/CorsConfig 파일에 전역적으로 cors 설정했으므로 controller에서 삭제가능
public class AuthController {

 private final KakaoLoginService kakaoLoginService;

 @Autowired
 public AuthController(KakaoLoginService kakaoLoginService) {
     this.kakaoLoginService = kakaoLoginService;
 }
 // 로그인(Login)
 @PostMapping("/kakao/callback")
 public ResponseEntity<?> kakaoCallback(@RequestBody Map<String, String> requestBody) {
     String code = requestBody.get("code");
     if (code == null) {
         return ResponseEntity.badRequest().body("카카오 인증 코드가 없습니다.");
     }

     try {
         Map<String, Object> loginResult = kakaoLoginService.kakaoLogin(code);
         User user = (User) loginResult.get("user");

         Map<String, String> response = new HashMap<>();
         response.put("access_token", loginResult.get("access_token").toString());
         response.put("refresh_token", loginResult.get("refresh_token").toString());
         response.put("nickname", user.getNickname());

         return ResponseEntity.ok(response);
     } catch (Exception e) {
         return ResponseEntity.status(500).body("카카오 로그인 처리 중 오류 발생: " + e.getMessage());
     }
 }
 
 // 기존 로그아웃 API (토큰 만료)
 @PostMapping("/logout")
 public ResponseEntity<?> kakaoLogout(@RequestHeader("Authorization") String authorization) {
     String accessToken = authorization.substring(7); // "Bearer " 제거

     try {
         kakaoLoginService.kakaoLogout(accessToken);
         return ResponseEntity.ok("로그아웃 성공");
     } catch (Exception e) {
         return ResponseEntity.status(500).body("로그아웃 처리 중 오류 발생: " + e.getMessage());
     }
 }
 
 //🔥 새로운 연결 끊기 API (unlink)
 @PostMapping("/kakao/unlink")
 public ResponseEntity<?> kakaoUnlink(@RequestHeader("Authorization") String authorization) {
     String accessToken = authorization.substring(7); // "Bearer " 제거

     try {
         kakaoLoginService.kakaoUnlink(accessToken);
         return ResponseEntity.ok("카카오 연결 해제 성공");
     } catch (Exception e) {
         return ResponseEntity.status(500).body("카카오 연결 해제 중 오류 발생: " + e.getMessage());
     }
 }
 
}
