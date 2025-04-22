package com.boot.tico.login.repository;

import com.boot.tico.login.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByProviderAndProviderId(String provider, String providerId);
    // 아이디 찾을때 동명이인 있을 수도 있으니 Optional이 아닌 List로 반환
    List<User> findByNameAndPhone(String name, String phone);
    // 닉네임 중복확인시 사용 
    Optional<User> findByNickname(String nickname);
}
