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

@Slf4j // 로깅 쉽게 확인할 수 있는 Lombok 어노테이션
@RestController  // 메서드들이 JSON 형태의 응답을 클라이언트에 반환 (인코딩된 코드)
@RequestMapping("/auth")
@RequiredArgsConstructor // final 필드들에 대해 생성자를 자동 생성해준다.
public class AuthController {
	// final "한 번 결정된 값은 바꿀 수 없다"는 것을 명시하여, 코드의 안정성과 예측 가능성을 높이는 역할
    private final UserService userService; // 회원 관련 로직(회원가입, 조회, 수정, 탈퇴 등)을 처리
    private final JwtTokenizer jwtTokenizer; // JWT 토큰을 생성하고, 검증하는 역할
    private final AuthenticationManager authenticationManager; // 회원 로그인 처리 담당

    // 일반 회원가입 API
    // 사용자가 회원가입할 때 입력한 정보를 받아 DB에 저장
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserDto.Request request) {
        try {
            // provider가 null이면 local(일반) 회원가입으로 처리
        	// provider는 naver,kakao등 소셜로그인 구별가능
            if(request.getProvider() == null) {
                request.setProvider("local");
            }
            User user = userService.registerUser(request); 
            // userService 이동해서 중복처리, 비밀번호 암호화 진행
            return ResponseEntity.ok(createUserResponse(user));
            // 중복처리 암호화 성공 시 jwt 토큰과 사용자 정보 전달
        } catch (IllegalArgumentException ex) { // 실패 시 400,409 오류 반환
            log.error("회원가입 유효성 검사 실패: {}", ex.getMessage());
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (RuntimeException ex) {
            log.error("회원가입 실패: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
        }
    }

    // 로그인 API (일반 로그인)
    // 사용자가 로그인할 때 이메일과 비밀번호를 받아서 인증한 후, JWT 토큰(Access Token, Refresh Token)을 발급합
    @PostMapping("/login")
    public ResponseEntity<UserDto.Response> login(@RequestBody UserDto.LoginRequest request) {
        UsernamePasswordAuthenticationToken authToken = // 사용자가 입력한 이메일과 비밀번호를 담은 인증 토큰을 만듬
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword());
        authenticationManager.authenticate(authToken); 
        // Spring Security가 제공하는 인증 매니저를 통해 사용자의 자격 증명을 확인

        User user = userService.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));
        // 인증 성공 시, 이메일을 db에서 정보 조회

        Map<String, Object> claims = Map.of("email", user.getEmail(), "user_id", user.getUser_id());
        String accessToken = jwtTokenizer.generateAccessToken(claims);
        String refreshToken = jwtTokenizer.generateRefreshToken();
        // email,id를 claims에 담아서 jwtToken을 이용해 새로운 accessToken,refreshToken 발급
        
       
        UserDto.Response response = new UserDto.Response();
        response.setUser_id(user.getUser_id());
        response.setEmail(user.getEmail());
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        // 새로 생성한 토큰값(accessToken,refreshToken)과 사용자 정보를 dto 담아 전달
        
        return ResponseEntity.ok(response); // 성공 시 반환
    }
    
    // 로그인한 사용자 정보 조회 (JWT의 principal 사용)
    @GetMapping("/user")
    public ResponseEntity<UserDto.Response> getUser(Principal principal) {
        String email = principal.getName(); // 현재 로그인한 사용자의 이메일을 얻음
        // Principal principal : Security에서 인증된 사용자 정보를 담은 객체
        log.debug("컨트롤러에서 받은 사용자 이메일: {}", email);
        if (email == null) {
            throw new RuntimeException("이메일이 null입니다! SecurityContext에 등록되지 않았습니다.");
        }
        User user = userService.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(createUserResponse(user));
        // 조회된 정보를 createUserResponse를 통해 jwt 토큰과 함께 응답 객체로 만들어 반환함
    }
    
    // 회원정보 수정 
    @PutMapping("/user")
    public ResponseEntity<?> updateUser(@RequestBody UserDto.Request request, Principal principal) {
        String email = principal.getName(); // 로그인한 사용자의 이메일을 가져와서 정보수정할 내용 결정
        log.debug("회원정보 수정 요청 이메일: {}", email);
        User user = userService.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // 수정 가능한 필드 업데이트 
        user.setNickname(request.getNickname());
        user.setPhone(request.getPhone());
        // 필요 시 추가 필드 업데이트

        // UserService 수정 로직 저장
        userService.saveUser(user);

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
        Map<String, Object> claims = Map.of("email", user.getEmail(), "user_id", user.getUser_id());
        String accessToken = jwtTokenizer.generateAccessToken(claims);
        String refreshToken = jwtTokenizer.generateRefreshToken();

        UserDto.Response response = new UserDto.Response();
        response.setUser_id(user.getUser_id());
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
