package com.boot.tico.chatbot.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "chat_log") // DB 테이블명
@Data // Lombok: Getter/Setter, toString, equals, hashCode 자동 생성
@NoArgsConstructor // 기본 생성자
@AllArgsConstructor // 모든 필드를 포함하는 생성자
public class ChatBotDTO {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // MariaDB의 AUTO_INCREMENT 사용
    @Column(name = "chat_log")
    private int chat_log; // 채팅 로그 기본키

    @Column(name = "user_uuid")
    private String user_uuid; // 사용자 식별자 (users 테이블과 외래키 관계)

    @Column(name = "file_path")
    private String filePath;  // 음성 파일 경로 (음성 메시지에 해당)

    @Column(nullable = false)
    private String msg;       // 텍스트 또는 음성에서 변환된 메시지 내용

    @Column(length = 1)
    private String record;    // 메시지 타입: "Y"=음성, "N"=텍스트, "B"=봇 응답

    @Column(length = 10)
    private String sender;    // 발신자 구분: "user", "bot"

    @CreationTimestamp
    @Column(name = "date_time", updatable = false)
    private Timestamp date_time; // 생성 시간 자동 입력
}
