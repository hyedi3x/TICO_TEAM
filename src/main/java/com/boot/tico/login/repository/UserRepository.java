package com.boot.tico.login.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.boot.tico.login.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
 User findByKakaoId(String kakaoId);
}
