package com.boot.tico.login.entity;


import lombok.Data; // JPA 어노테이션 (Spring Boot 3.x)
import javax.persistence.*; // javax → jakarta 자바 버젼 변경으로 인한 수정(2.7.4 -> 3.1.0)
import java.time.LocalDateTime;// LocalDateTime 클래스


// 버젼 2.7.4의 경우에는 import persistence 필수 
@Entity
@Data
@Table(name = "tico_users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "users_seq_generator")
    @SequenceGenerator(name = "users_seq_generator", sequenceName = "USERS_SEQ", allocationSize = 1)
    private Long id;

    @Column(unique = true)
    private String kakaoId;

    private String nickname;

    @Column(nullable = true, unique = true)
    private String email;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}