package com.boot.tico.login.entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "users")
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

    @Column(length = 50)
    private String provider;

    @Column(name = "provider_id", length = 255)
    private String providerId;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // DB의 UNIQUE 제약 조건 (provider, provider_id) 사용
    @Column(unique = true)
    private String providerWithId;

    @PrePersist
    public void prePersist() {
        if (provider != null && providerId != null) {
            providerWithId = provider + "_" + providerId;
        }
    }
}
