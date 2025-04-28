package com.boot.tico.login.service;

import com.boot.tico.login.dto.UserDto;
import com.boot.tico.login.entity.User;
import com.boot.tico.login.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final StringRedisTemplate redis;               

    private static final String REDIS_PREFIX = "register:verified:";
    
    
    // ----------------------------------------------------------------
    // 이메일 인증 확인 여부 (REDIS_PREFIX + email 상자에서 값꺼내기 값이 ok면 ture / 아니면 false 반환)
    // ----------------------------------------------------------------
    public boolean isEmailAlreadyVerified(String email) {
        String flag = redis.opsForValue().get(REDIS_PREFIX + email);
        return "OK".equals(flag);
    }

    // 인증 단계에서 코드가 맞으면 Redis 에 플래그를 남기는 메서드 (예시)
    public void markEmailVerified(String email) {
        redis.opsForValue().set(REDIS_PREFIX + email, "OK");
    }
    
    
    // 일반 회원가입 처리
    public User registerUser(UserDto.Request request) {
        // 이메일 형식 검증
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
        if (request.getEmail() == null || !request.getEmail().matches(emailRegex)) {
            throw new IllegalArgumentException("유효하지 않은 이메일 형식입니다.");
        }

        // 일반 회원가입은 비밀번호가 필수 (소셜 가입은 null일 수 있음)
        if ("local".equals(request.getProvider())) {
        	
        	// 비밀번호 검증
            if (request.getPassword() == null || request.getPassword().length() < 5) {
                throw new IllegalArgumentException("비밀번호는 5자 이상이어야 합니다.");
            }
            // 이미 존재하는 이메일 체크
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new RuntimeException("이미 존재하는 이메일입니다.");
            }
            
            // 닉네임 중복 체크
            if (userRepository.findByNickname(request.getNickname()).isPresent()) {
                throw new RuntimeException("이미 존재하는 닉네임입니다.");
            }
            
            User user = new User();
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setPhone(request.getPhone());
            user.setName(request.getName());
            user.setNickname(request.getNickname());
            user.setProvider("local");
            user.setBirthDate(request.getBirthDate());
            
            return userRepository.save(user);
        } else {
            // 소셜 회원가입은 별도 API에서 처리
            throw new RuntimeException("소셜 회원가입은 /auth/social/register API를 사용하세요.");
        }
    }
    
    // email 찾기 
    public List<User> findByNameAndPhone(String name, String phone) {
    	return userRepository.findByNameAndPhone(name,phone);
    }
    
    
    // 이메일로 사용자 조회
    public Optional<User> findByEmail(String email) {
        log.debug("DB에서 조회할 이메일: {}", email);
        return userRepository.findByEmail(email);
    }
    
    // 비밀번호 찾기 (소셜 로그인아이디는 비밀번호 재설정 불가하도록 provider local만 가능하도록 구현)
    public void updatePassword(String email, String rawNewPassword) {
        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isPresent()) {
            User user = opt.get();
            // 소셜 로그인 계정이면 비밀번호 재설정 불가
            if (!"local".equals(user.getProvider())) {
                throw new RuntimeException("소셜 로그인 계정은 비밀번호 재설정이 불가능합니다.");
            }
            user.setPassword(passwordEncoder.encode(rawNewPassword));
            userRepository.save(user);
        } else {
            throw new RuntimeException("해당 이메일의 사용자를 찾을 수 없습니다.");
        }
    }
    
    // 회원 정보 수정
    public User saveUser(User user) {
        return userRepository.save(user);
    }
    
    // 회원 탈퇴 처리
    public void deleteUser(String email) {
        userRepository.findByEmail(email).ifPresent(userRepository::delete);
    }
    
    // 소셜 사용자인지 (email + provider) 조회
    public Optional<User> findOAuth2User(String email, String provider) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent() && provider.equals(userOptional.get().getProvider())) {
            return userOptional;
        }
        return Optional.empty();
    }

    // 소셜 회원가입: 추가 정보와 소셜 정보를 함께 등록
    // UserDto.Request를 사용하며, password는 null로 처리함
    public User registerSocialUser(UserDto.Request request) {
        // 이미 존재하는 이메일 체크
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("이미 존재하는 이메일입니다.");
        }
        User user = new User();
        user.setEmail(request.getEmail());
        user.setProvider(request.getProvider());
        user.setProviderId(request.getProviderId());
        user.setName(request.getName());

        user.setBirthDate(request.getBirthDate());    // 전달받은 birthDate 저장
        user.setPhone(request.getPhone());            // 전달받은 phone 저장
        user.setNickname(request.getNickname());      // 전달받은 nickname 저장

        user.setCreatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
}