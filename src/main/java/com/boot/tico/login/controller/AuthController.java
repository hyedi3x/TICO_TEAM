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

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import java.security.Principal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

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
    
    
    /** 1) 가입 전(미등록) 이메일로 코드 발송 */
    @PostMapping("/send-register-code")
    public ResponseEntity<?> sendRegisterCode(
            @RequestBody Map<String,String> payload,
            HttpSession session
    ) {
        String email = payload.get("email");
        // 이미 가입된 이메일이면 충돌 처리
        if (userService.findByEmail(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                                 .body("이미 사용중인 이메일입니다.");
        }
        // 6자리 랜덤 코드 생성
        String code = String.format("%06d", new Random().nextInt(1_000_000));
        // 메일 발송
        emailService.sendMail(
            email,
            "TICO 회원가입 이메일 인증 코드",
            "인증 코드: " + code
        );

        // 세션에 저장 + 3분 TTL
        session.setAttribute("registerEmail", email);
        session.setAttribute("registerCode", code);
        session.setAttribute("isEmailVerified", false);
        session.setMaxInactiveInterval(3 * 60);

        return ResponseEntity.ok("인증 코드 발송 완료");
    }

    /** 2) 가입 전 이메일 코드 검증 */
    @PostMapping("/verify-register-code")
    public ResponseEntity<?> verifyRegisterCode(
            @RequestBody Map<String,String> payload,
            HttpSession session
    ) {
        String email = payload.get("email");
        String code  = payload.get("code");

        String savedEmail = (String) session.getAttribute("registerEmail");
        String savedCode  = (String) session.getAttribute("registerCode");

        if (savedEmail == null || savedCode == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                 .body("인증 코드가 만료되었습니다. 다시 요청해주세요.");
        }
        if (!savedEmail.equals(email) || !savedCode.equals(code)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                 .body("인증 코드가 올바르지 않습니다.");
        }

        // 검증 성공 → 세션 플래그 업데이트
        session.setAttribute("isEmailVerified", true);
        // 코드 재사용 방지
        session.removeAttribute("registerCode");

        return ResponseEntity.ok("이메일 인증 성공");
    }
    
    
    
    // 일반 사용자 회원가입
    // 사용자가 회원가입할 때 입력한 정보를 받아 DB에 저장
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserDto.Request request,  HttpSession session) {
        
    	// 세션에서 인증 여부 확인
        Boolean verified = (Boolean) session.getAttribute("isEmailVerified");
        String   savedEmail = (String) session.getAttribute("registerEmail");
        if (verified == null || !verified || !request.getEmail().equals(savedEmail)) {
            return ResponseEntity.badRequest()
                                 .body("이메일 인증을 먼저 완료해주세요.");
        }
    	
        try {
            if (request.getProvider() == null) {
                request.setProvider("local");
            }
            User user = userService.registerUser(request);

            // 세션 플래그 제거(재사용 방지)
            session.removeAttribute("isEmailVerified");
            session.removeAttribute("registerEmail");

            // 회원 생성 후 JWT 응답 생성
            Map<String, Object> claims = Map.of(
                "email", user.getEmail(),
                "user_uuid", user.getUser_uuid(),
                "userType", "CUSTOMER"
            );
            String accessToken  = jwtTokenizer.generateAccessToken(claims);
            String refreshToken = jwtTokenizer.generateRefreshToken(claims);
            long expiryMs = jwtTokenizer.getRefreshTokenExpiration();

            // DB에 리프레시 토큰 저장
            user.setRefreshToken(refreshToken);
            user.setRefreshTokenExpiry(
                LocalDateTime.now().plus(expiryMs, ChronoUnit.MILLIS)
            );
            userService.saveUser(user);

            // 쿠키 세팅
            ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(true) // HTTP에서는 FALSE로 설정 가능하지만 HTTPS 환경에서는 TRUE 환경 이여야함
                .path("/")
                .maxAge(expiryMs / 1000)
                .sameSite("None")
                .build();

            return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(Map.of(
                    "user_uuid", user.getUser_uuid(),
                    "email", user.getEmail(),
                    "nickname", user.getNickname(),
                    "accessToken", accessToken
                ));

        } catch (IllegalArgumentException ex) {
            log.error("회원가입 유효성 오류: {}", ex.getMessage());
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
        long expiryMs = jwtTokenizer.getRefreshTokenExpiration();
        
        
        // 4) DB에 리프레시 토큰과 만료일시 저장

        user.setRefreshToken(refreshToken);
        user.setRefreshTokenExpiry(
            LocalDateTime.now().plus(expiryMs, ChronoUnit.MILLIS)
        );
        userService.saveUser(user);

        // 5) HttpOnly 쿠키에 refreshToken 세팅 (개발환경용)
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
            .httpOnly(true)
            .secure(true)        // 로컬 HTTP 환경에서는 false / HTTPS 환경에서는 ture
            .path("/")
            .maxAge(expiryMs / 1000)
            .sameSite("None")     // React(front) → API(back) 간 cross-site 허용
            .build();
        response.setHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        // 6) JSON 응답에 accessToken 포함
        UserDto.Response resp = new UserDto.Response();
        resp.setUser_uuid(user.getUser_uuid());
        resp.setEmail(user.getEmail());
        resp.setNickname(user.getNickname());
        resp.setAccessToken(accessToken);    
        
        // ResponseEntity로 헤더에 달아 주면 덮어쓰임 없이 한 번에 확실히 설정딤
        return ResponseEntity.ok()
        		.header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(resp);
    }

    
    // 사원 로그인 (사전에 DB에 등록되어 있는 정보 기반 / 비밀번호 암호화 x)
    // 내부 DTO를 사용하지 않고, ERP 모듈의 EmpDTO를 @RequestBody로 직접 받습니다.
 // AuthController.java - loginEmployee()
    @PostMapping("/login/employee")
    public ResponseEntity<UserDto.Response> loginEmployee(
            @RequestBody EmpDTO empRequest,
            HttpServletResponse response
    ) {
        // 1) 인증
        EmpDTO emp = employeeAuthService.authenticate(empRequest.getEmpId(), empRequest.getEmpPwd())
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        // 2) 클레임 준비 및 토큰 생성
        Map<String, Object> claims = Map.of(
            "empId", emp.getEmpId(),
            "dep_Id", emp.getDepId(),
            "userType","EMPLOYEE"
        );
        String accessToken  = jwtTokenizer.generateAccessToken(claims);
        String refreshToken = jwtTokenizer.generateRefreshToken(claims);
        long expiryMs = jwtTokenizer.getRefreshTokenExpiration();
        LocalDateTime expiryDateTime = LocalDateTime.now().plus(expiryMs, ChronoUnit.MILLIS);

        // ✅ 3) DB에 저장 - EmpDTO에 저장되도록 수정
        employeeAuthService.saveRefreshToken(emp.getEmpId(), refreshToken, expiryDateTime);

        // 4) 쿠키로 refreshToken 전달
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
            .httpOnly(true)
            .secure(true)
            .path("/")
            .maxAge(expiryMs / 1000)
            .sameSite("Strict")
            .build();
        response.setHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        // 5) JSON 응답
        UserDto.Response resp = new UserDto.Response();
        resp.setUser_uuid(emp.getEmpId());
        resp.setEmail(emp.getEmpEmail());
        resp.setAccessToken(accessToken);
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
    public ResponseEntity<String> logout(HttpServletRequest request, 
                                                                             HttpServletResponse response,
                                                                         Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("인증 정보가 없습니다(이미 로그아웃 되었거나 토큰 만료)");
        }

        String identity = principal.getName(); // 이메일 or 사번
        String userType = (String) request.getAttribute("userType");

        // 1️⃣ 고객(일반/소셜) 로그아웃 처리
        if ("CUSTOMER".equals(userType)) {
            Optional<User> userOpt = userService.findByEmail(identity);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setRefreshToken(null);
                user.setRefreshTokenExpiry(null);
                userService.saveUser(user);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("사용자를 찾을 수 없습니다.");
            }
        }

        // 2️⃣ 사원 로그아웃 처리
        else if ("EMPLOYEE".equals(userType)) {
            Optional<EmpDTO> empOpt = employeeAuthService.findByEmpId(identity);
            if (empOpt.isPresent()) {
                // null 값 저장을 허용하는 메서드 (아래 참고)
                employeeAuthService.saveRefreshToken(identity, null, null);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("사원을 찾을 수 없습니다.");
            }
        }
        
        // 로그아웃시 쿠기 같이 삭제됨
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                    .httpOnly(true)
                    .secure(true)
                    .path("/")
                    .maxAge(0) // ✅ 만료
                    .sameSite("Strict")
                    .build();
                response.setHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        // 3️⃣ 세션 정리
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
    public ResponseEntity<Map<String, String>> refresh(HttpServletRequest request) {
        // 1) 쿠키에서 refreshToken 찾기
        String refreshToken = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie c : cookies) {
                if ("refreshToken".equals(c.getName())) {
                    refreshToken = c.getValue();
                    break;
                }
            }
        }
        if (refreshToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            // 2) Refresh Token 유효성 검사
            Claims claims = jwtTokenizer.parseClaims(refreshToken);

            // 3) 클레임 기반으로 새 Access Token 생성
            Map<String, Object> newClaims = Map.of(
                "email",     claims.get("email", String.class),
                "user_uuid", claims.get("user_uuid", String.class),
                "userType",  claims.get("userType", String.class)
            );
            String newAccessToken = jwtTokenizer.generateAccessToken(newClaims);

            // 4) 새 토큰 반환
            return ResponseEntity.ok(Map.of("accessToken", newAccessToken));

        } catch (ExpiredJwtException e) {
            // Refresh Token도 만료된 경우
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
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
