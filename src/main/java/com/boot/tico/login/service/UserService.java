package com.boot.tico.login.service;

import com.boot.tico.login.dto.UserDto;
import com.boot.tico.login.entity.User;
import com.boot.tico.login.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // 일반 회원가입 처리
    public User registerUser(UserDto.Request request) {
        // 이메일 형식 검증
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
        if (request.getEmail() == null || !request.getEmail().matches(emailRegex)) {
            throw new IllegalArgumentException("유효하지 않은 이메일 형식입니다.");
        }

        // 일반 회원가입은 비밀번호가 필수 (소셜 가입은 null일 수 있음)
        if ("local".equals(request.getProvider())) {
            if (request.getPassword() == null || request.getPassword().length() < 5) {
                throw new IllegalArgumentException("비밀번호는 5자 이상이어야 합니다.");
            }
            // 이미 존재하는 이메일 체크
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new RuntimeException("이미 존재하는 이메일입니다.");
            }
            User user = new User();
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setPhone(request.getPhone());
            user.setName(request.getName());
            user.setNickname(request.getNickname());
            user.setProvider("local");
            return userRepository.save(user);
        } else {
            // 소셜 회원가입은 별도 API에서 처리
            throw new RuntimeException("소셜 회원가입은 /auth/social/register API를 사용하세요.");
        }
    }

    // 이메일로 사용자 조회
    public Optional<User> findByEmail(String email) {
        log.debug("DB에서 조회할 이메일: {}", email);
        return userRepository.findByEmail(email);
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
        // 소셜 회원가입은 비밀번호가 없으므로 password 필드는 null
        user.setName(request.getName());
        user.setNickname(request.getNickname());
        user.setPhone(request.getPhone());
        user.setProvider(request.getProvider());
        user.setProviderId(request.getProviderId());
        return userRepository.save(user);
    }
}
