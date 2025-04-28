package com.boot.tico.login.service;

import com.boot.tico.login.dto.UserDto;
import com.boot.tico.login.entity.User;
import com.boot.tico.login.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    // 일반 회원가입 처리
    public User registerUser(UserDto.Request request) {
        // 이메일 형식 검증
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
        if (request.getEmail() == null || !request.getEmail().matches(emailRegex)) {
            throw new IllegalArgumentException("유효하지 않은 이메일 형식입니다.");
        }

        if ("local".equals(request.getProvider())) {
            // 비밀번호 검증
            if (request.getPassword() == null || request.getPassword().length() < 5) {
                throw new IllegalArgumentException("비밀번호는 5자 이상이어야 합니다.");
            }
            // 이메일/닉네임 중복 체크
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new RuntimeException("이미 존재하는 이메일입니다.");
            }
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
            throw new RuntimeException("소셜 회원가입은 /auth/social/register API를 사용하세요.");
        }
    }

    // 이름+전화번호로 이메일 찾기
    public List<User> findByNameAndPhone(String name, String phone) {
        return userRepository.findByNameAndPhone(name, phone);
    }

    // 이메일로 사용자 조회
    public Optional<User> findByEmail(String email) {
        log.debug("DB에서 조회할 이메일: {}", email);
        return userRepository.findByEmail(email);
    }

    // 비밀번호 재설정
    public void updatePassword(String email, String rawNewPassword) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("해당 이메일의 사용자를 찾을 수 없습니다."));
        if (!"local".equals(user.getProvider())) {
            throw new RuntimeException("소셜 로그인 계정은 비밀번호 재설정이 불가능합니다.");
        }
        user.setPassword(passwordEncoder.encode(rawNewPassword));
        userRepository.save(user);
    }

    // 회원정보 수정
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    // 회원 탈퇴
    public void deleteUser(String email) {
        userRepository.findByEmail(email).ifPresent(userRepository::delete);
    }

    // 소셜 사용자인지 확인
    public Optional<User> findOAuth2User(String email, String provider) {
        return userRepository.findByEmail(email)
            .filter(u -> provider.equals(u.getProvider()));
    }

    // 소셜 회원가입
    public User registerSocialUser(UserDto.Request request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("이미 존재하는 이메일입니다.");
        }
        User user = new User();
        user.setEmail(request.getEmail());
        user.setProvider(request.getProvider());
        user.setProviderId(request.getProviderId());
        user.setName(request.getName());
        user.setBirthDate(request.getBirthDate());
        user.setPhone(request.getPhone());
        user.setNickname(request.getNickname());
        user.setCreatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
}
