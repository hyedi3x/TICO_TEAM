package com.boot.tico.chatbot.dto;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name="CHAT_LOG")
public class ChatBotDTO {
    @Id
    @SequenceGenerator(schema="tico", name="CHAT_LOG_SEQ", sequenceName="CHAT_LOG_SEQ", allocationSize=1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator="CHAT_LOG_SEQ")
    @Column(name="id")
    private int id;
    private String content;
    private String filePath; // 파일 경로 필드 추가
    private String msg; // 텍스트 메시지 필드 추가
    private String record; // 음성 기록 여부 필드 추가 ("Y" or "N")

    @CreationTimestamp
    private Timestamp date_time;

    public ChatBotDTO() {
        super();
    }

    public ChatBotDTO(int id, String content, String filePath, String msg, String record, Timestamp date_time) {
        super();
        this.id = id;
        this.content = content;
        this.filePath = filePath;
        this.msg = msg;
        this.record = record;
        this.date_time = date_time;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public String getRecord() {
        return record;
    }

    public void setRecord(String record) {
        this.record = record;
    }

    public Timestamp getDate_time() {
        return date_time;
    }

    public void setDate_time(Timestamp date_time) {
        this.date_time = date_time;
    }

    @Override
    public String toString() {
        return "ChatBotDTO [id=" + id + ", content=" + content + ", filePath=" + filePath + ", msg=" + msg + ", record=" + record + ", date_time=" + date_time + "]";
    }
}