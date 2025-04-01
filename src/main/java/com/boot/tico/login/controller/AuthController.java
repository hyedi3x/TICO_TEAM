package com.boot.tico.login.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import com.boot.tico.login.dto.UserDto;
import com.boot.tico.login.entity.User;
import com.boot.tico.login.security.JwtTokenizer;
import com.boot.tico.login.service.UserService;

import javax.servlet.http.HttpServletRequest;

import java.security.Principal;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;
    private final JwtTokenizer jwtTokenizer;
    private final AuthenticationManager authenticationManager;

    // 일반 회원가입 API
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserDto.Request request) {
        try {
            // provider가 null이면 local(일반) 회원가입으로 처리
            if(request.getProvider() == null) {
                request.setProvider("local");
            }
            User user = userService.registerUser(request);
            return ResponseEntity.ok(createUserResponse(user));
        } catch (IllegalArgumentException ex) {
            log.error("회원가입 유효성 검사 실패: {}", ex.getMessage());
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (RuntimeException ex) {
            log.error("회원가입 실패: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
        }
    }

    // 로그인 API (일반 로그인)
    @PostMapping("/login")
    public ResponseEntity<UserDto.Response> login(@RequestBody UserDto.LoginRequest request) {
        UsernamePasswordAuthenticationToken authToken =
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword());
        authenticationManager.authenticate(authToken);

        User user = userService.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> claims = Map.of("email", user.getEmail(), "id", user.getId());
        String accessToken = jwtTokenizer.generateAccessToken(claims);
        String refreshToken = jwtTokenizer.generateRefreshToken();

        UserDto.Response response = new UserDto.Response();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        
        return ResponseEntity.ok(response);
    }
    
    // 로그인한 사용자 정보 조회 (JWT의 principal 사용)
    @GetMapping("/user")
    public ResponseEntity<UserDto.Response> getUser(Principal principal) {
        String email = principal.getName();
        log.debug("컨트롤러에서 받은 사용자 이메일: {}", email);
        if (email == null) {
            throw new RuntimeException("이메일이 null입니다! SecurityContext에 등록되지 않았습니다.");
        }
        User user = userService.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(createUserResponse(user));
    }

    // 로그아웃 API
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request) {
        request.getSession().invalidate();
        return ResponseEntity.ok("로그아웃 성공");
    }
    
    // 회원 탈퇴 API
    @DeleteMapping("/user")
    public ResponseEntity<String> deleteUser(@RequestParam String email) {
        userService.deleteUser(email);
        return ResponseEntity.ok("회원 탈퇴 완료");
    }

    // JWT 토큰 재발급 API
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refresh(@RequestBody Map<String, Object> claims) {
        String newAccessToken = jwtTokenizer.generateAccessToken(claims);
        return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
    }
    
    // 소셜 회원가입 API (추가 정보 입력 후 DB 저장)
    // UserDto.Request를 사용하여 provider, providerId 등의 정보와 함께 저장
    @PostMapping("/social/register")
    public ResponseEntity<?> socialRegister(@RequestBody UserDto.Request request) {
        try {
            // 소셜 회원가입의 경우 password는 null이므로 따로 검증하지 않음
            User user = userService.registerSocialUser(request);
            return ResponseEntity.ok(createUserResponse(user));
        } catch (RuntimeException ex) {
            log.error("소셜 회원가입 실패: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }

    // JWT 토큰을 포함한 응답 객체 생성 메서드
    private UserDto.Response createUserResponse(User user) {
        Map<String, Object> claims = Map.of("email", user.getEmail(), "id", user.getId());
        String accessToken = jwtTokenizer.generateAccessToken(claims);
        String refreshToken = jwtTokenizer.generateRefreshToken();

        UserDto.Response response = new UserDto.Response();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setName(user.getName());
        response.setNickname(user.getNickname());
        response.setPhone(user.getPhone());
        response.setProvider(user.getProvider());
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        return response;
    }
}
