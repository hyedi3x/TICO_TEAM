package com.boot.tico.login.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import com.boot.tico.erp.dto.EmpDTO;
import com.boot.tico.erp.service.EmployeeAuthService;
import com.boot.tico.login.dto.UserDto;
import com.boot.tico.login.entity.User;
import com.boot.tico.login.security.JwtTokenizer;
import com.boot.tico.login.service.EmailService;
import com.boot.tico.login.service.UserService;
import com.boot.tico.login.service.VerificationCodeService;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.security.Principal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j // 로깅 쉽게 확인할 수 있는 Lombok 어노테이션
@RestController  // 메서드들이 JSON 형태의 응답을 클라이언트에 반환 (인코딩된 코드)
@RequestMapping("/auth")
@RequiredArgsConstructor // final 필드들에 대해 생성자를 자동 생성해준다.
public class AuthController {
	
	// final "한 번 결정된 값은 바꿀 수 없다"는 것을 명시하여, 코드의 안정성과 예측 가능성을 높이는 역할
    private final UserService userService; // 회원 관련 로직(회원가입, 조회, 수정, 탈퇴 등)을 처리
    private final JwtTokenizer jwtTokenizer; // JWT 토큰을 생성하고, 검증하는 역할
    private final AuthenticationManager authenticationManager; // 회원 로그인 처리 담당 
    private final EmployeeAuthService employeeAuthService; // 기존 EmployeeService 대신 인증용 EmployeeAuthService 주입
    
    // email/pwd 찾기
    private final EmailService emailService;
    private final VerificationCodeService codeService;
    
 // [이메일(아이디) 찾기] : 이름과 전화번호로 사용자 조회하여 이메일 반환
    @PostMapping("/find-id")
    public ResponseEntity<?> findId(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        String phone = payload.get("phone");
        List<User> users = userService.findByNameAndPhone(name, phone);

        if (users.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                 .body("해당 정보로 가입된 사용자를 찾을 수 없습니다.");
        }
        if (users.size() > 1) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                                 .body("같은 이름, 전화번호로 2명 이상이 가입되었습니다.");
        }
        // 유일하게 1명 찾았을 때:
        User user = users.get(0);
        Map<String, String> res = new HashMap<>();
        res.put("email", user.getEmail());
        return ResponseEntity.ok(res);
    }
    
    // [인증 코드 발송] : 가입된 이메일을 대상으로 인증 코드 생성 및 메일 발송
    @PostMapping("/send-code")
    public ResponseEntity<?> sendCode(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        Optional<User> userOpt = userService.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                 .body("가입된 이메일이 아닙니다.");
        }
        
        User user = userOpt.get();
        // 소셜 로그인 계정이면 즉시 에러 응답
        if (!"local".equals(user.getProvider())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                 .body("소셜 로그인 계정은 비밀번호 재설정이 불가능합니다.");
        }
        
        String code = codeService.generateCode(email);
        emailService.sendMail(email, "인증 코드 안내", "인증 코드: " + code);
        return ResponseEntity.ok("인증 코드 발송 완료");
    }
    
    // [인증 코드 검증] : 전달받은 인증 코드와 저장된 코드를 비교
    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyCode(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String code = payload.get("code");
        boolean result = codeService.verifyCode(email, code);
        if (!result) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                 .body("인증 코드가 틀렸거나 만료되었습니다.");
        }
        return ResponseEntity.ok("인증 성공");
    }
    
    // [비밀번호 재설정] : 인증된 이메일과 새 비밀번호로 업데이트 진행
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String newPassword = payload.get("newPassword");
        try {
            userService.updatePassword(email, newPassword);
            return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }
    
    
    
    
    // 일반 사용자 회원가입
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

    // 일반 로그인 (이메일 + 비밀번호)
    @PostMapping("/login/customer")
    public ResponseEntity<UserDto.Response> loginCustomer(
            @RequestBody UserDto.LoginRequest request,
            HttpServletResponse response
    ) {
        // 1) 인증
        UsernamePasswordAuthenticationToken authToken =
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword());
        authenticationManager.authenticate(authToken);

        // 2) 사용자 조회 및 클레임 생성
        User user = userService.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));
        Map<String, Object> claims = Map.of(
            "email",     user.getEmail(),
            "user_uuid", user.getUser_uuid(),
            "userType",  "CUSTOMER"
        );

        // 3) 토큰 발급
        String accessToken  = jwtTokenizer.generateAccessToken(claims);
        String refreshToken = jwtTokenizer.generateRefreshToken(claims);

        // 4) DB에 리프레시 토큰과 만료일시 저장
        long expiryMs = jwtTokenizer.getRefreshTokenExpiration();
        user.setRefreshToken(refreshToken);
        user.setRefreshTokenExpiry(
            LocalDateTime.now().plus(expiryMs, ChronoUnit.MILLIS)
        );
        userService.saveUser(user);

        // 5) HttpOnly 쿠키에 refreshToken 세팅 (개발환경용)
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
            .httpOnly(true)
            .secure(false)        // ✅ 로컬 HTTP 환경에서는 false
            .path("/")
            .maxAge(expiryMs / 1000)
            .sameSite("None")     // ✅ React(front) → API(back) 간 cross-site 허용
            .build();
        response.setHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        // 6) JSON 응답에 accessToken 포함
        UserDto.Response resp = new UserDto.Response();
        resp.setUser_uuid(user.getUser_uuid());
        resp.setEmail(user.getEmail());
        resp.setNickname(user.getNickname());
        resp.setAccessToken(accessToken);    // ✅ 이 줄이 빠져 있어서 토큰이 null 로 전달됐습니다

        return ResponseEntity.ok(resp);
    }

    
    // 사원 로그인 (사전에 DB에 등록되어 있는 정보 기반 / 비밀번호 암호화 x)
    // 내부 DTO를 사용하지 않고, ERP 모듈의 EmpDTO를 @RequestBody로 직접 받습니다.
    @PostMapping("/login/employee")
    public ResponseEntity<UserDto.Response> loginEmployee(
            @RequestBody EmpDTO empRequest,
            HttpServletResponse response   // 쿠키를 쓰려면 이 파라미터가 필요함
    ) {
        // 1) 사원 인증
        EmpDTO emp = employeeAuthService.authenticate(empRequest.getEmpId(), empRequest.getEmpPwd())
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        // 2) 클레임 준비 및 토큰 생성
        Map<String, Object> claims = Map.of(
            "empId",   emp.getEmpId(),
            "dep_Id",  emp.getDepId(),
            "userType","EMPLOYEE"
        );
        String accessToken  = jwtTokenizer.generateAccessToken(claims);
        String refreshToken = jwtTokenizer.generateRefreshToken(claims);

        // 3) DB에 refreshToken 저장
        User user = userService.findByEmail(emp.getEmpEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));
        long expiryMs = jwtTokenizer.getRefreshTokenExpiration();
        user.setRefreshToken(refreshToken);
        user.setRefreshTokenExpiry(
            LocalDateTime.now()
                         .plus(expiryMs, ChronoUnit.MILLIS)
        );
        userService.saveUser(user);

        // 4) HttpOnly 쿠키에 refreshToken 내려주기
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
            .httpOnly(true)
            .secure(true)
            .path("/")
            .maxAge(expiryMs / 1000)   // 초 단위
            .sameSite("Strict")
            .build();
        response.setHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        // 5) JSON 응답에는 accessToken만
        UserDto.Response resp = new UserDto.Response();
        resp.setUser_uuid(emp.getEmpId());
        resp.setEmail(emp.getEmpEmail());
        resp.setAccessToken(accessToken);
        // refreshToken 필드는 채우지 않습니다
        return ResponseEntity.ok(resp);
    }
    
    
    // 로그인 사용자 정보 조회 (고객,사원 통합 처리 / JWT의 principal 사용)
    @GetMapping("/user")
    public ResponseEntity<UserDto.Response> getUser(Principal principal) {
        if (principal == null) {
            // 401 Unauthorized 응답으로 처리하면, 프론트엔드 axios 인터셉터가 refresh 로직을 실행할 수 있습니다.
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        String identity = principal.getName();
        // 일반 유저 찾기 (email로 찾기)
        Optional<User> userOpt = userService.findByEmail(identity);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return ResponseEntity.ok(createUserResponse(user));
        }
        
        // 사원 찾기 (employee empId로 찾기)
        Optional<EmpDTO> empOpt = employeeAuthService.findByEmpId(identity);
        if (empOpt.isPresent()) {
            EmpDTO emp = empOpt.get();

            UserDto.Response res = new UserDto.Response();
            res.setUser_uuid(emp.getEmpId());
            res.setEmail(emp.getEmpEmail());
            res.setName(emp.getEmpName());
            res.setPhone(emp.getEmpPhone());
            res.setProvider("employee"); // 선택사항

            return ResponseEntity.ok(res);
        }

        // 사용자 정보를 찾지 못한 경우도 404나 401로 처리할 수 있습니다.
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
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
    

    // 로그아웃 처리
    // 사용자가 로그아웃할 때, 현재 세션을 무효화하여 로그아웃 처리
    @PostMapping("/logout")
    
    public ResponseEntity<String> logout(HttpServletRequest request, Principal principal) {
    	if (principal == null) {
    		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증 정보가 없습니다(이미 로그아웃 이거나 토큰 만료)");
    	}
    	// DB에서 지우기
    	User user = userService.findByEmail(principal.getName())
    	    .orElseThrow(() -> new RuntimeException("User not found"));
    	user.setRefreshToken(null);
    	user.setRefreshTokenExpiry(null);
    	userService.saveUser(user);
    	
    	// 세션 무효화
        request.getSession().invalidate(); 
        
        // HttpServletRequest의 getSession().invalidate()를 호출하여 현재 세션을 종료
        return ResponseEntity.ok("로그아웃 성공");
        // 로그아웃 성공 메세지를 클라이언트에 전달
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
        Map<String, Object> claims = Map.of(
        		"email", user.getEmail(),
        		"user_uuid", user.getUser_uuid(),
        		"userType", "CUSTOMER"
        );
        		
        String accessToken = jwtTokenizer.generateAccessToken(claims);
        String refreshToken = jwtTokenizer.generateRefreshToken(claims);

        UserDto.Response response = new UserDto.Response();
        response.setUser_uuid(user.getUser_uuid());
        response.setEmail(user.getEmail());
        response.setName(user.getName());
        response.setNickname(user.getNickname());
        response.setBirthDate(user.getBirthDate());
        response.setPhone(user.getPhone());
        response.setProvider(user.getProvider());
        response.setAccessToken(accessToken);
        return response;
    }
}
