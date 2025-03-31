package com.boot.tico.chatbot.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.sql.Timestamp;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "CHAT_LOG")
public class ChatBotDTO {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // MariaDB의 AUTO_INCREMENT를 사용
    @Column(name = "id")
    private int id;

    private String content;
    private String filePath; 
    private String msg;  
    private String record;  // "Y" or "N"

    @CreationTimestamp
    @Column(name = "date_time", updatable = false)
    private Timestamp date_time;

}
