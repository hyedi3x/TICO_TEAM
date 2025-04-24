package com.boot.tico.login.entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "users",
	   uniqueConstraints = @UniqueConstraint(columnNames = {"provider", "provider_id"})
)

public class User {
	
    @Id
    @Column(name = "user_uuid", columnDefinition = "VARCHAR(36)")
    private String user_uuid = java.util.UUID.randomUUID().toString();

    @Column(nullable = false, unique = true)
    private String email;

    @Column(length = 255)
    private String password;

    @Column(length = 20)
    private String phone;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 100)
    private String nickname;
    
    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;   
    
    // refresh token 컬럼
    @Column(name = "refresh_token", length = 255)
    private String refreshToken;

    // 만료일시 컬럼
    @Column(name = "refresh_token_expiry")
    private LocalDateTime refreshTokenExpiry;


    @Column(length = 50)
    private String provider;

    @Column(name = "provider_id", length = 255)
    private String providerId;
    
    // refresh token 컬럼
    @Column(name = "refresh_token", length = 255)
    private String refreshToken;

    // 만료일시 컬럼
    @Column(name = "refresh_token_expiry")
    private LocalDateTime refreshTokenExpiry;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
