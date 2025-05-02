package com.boot.tico.erp.dto;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "erp_notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id", nullable = false)
    private Long notificationId;

    // 개인 알림 전용
    @Column(name = "emp_id", nullable = false)
    private String empId;       // 알림 받을 사람 / "ALL" or 개별 ID (예: admin001)

    @Column(name = "notification_title", nullable = false)
    private String notificationTitle;  // 알림 제목

    @Column(name = "notification_message", columnDefinition = "TEXT")
    private String notificationMessage; // 알림 본문 (선택)

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;     // 읽음 여부

    @Column(name = "created_at", nullable = false, updatable = false)
    private Timestamp createdAt = new Timestamp(System.currentTimeMillis());

    @Column(name = "related_type")
    private String relatedType;     // 'notice' or 'schedule'

    @Column(name = "related_id")
    private Long relatedId;         // 공지 ID나 일정 ID

    @Column(name = "link_url")
    private String linkUrl;         // 클릭 시 이동할 링크
    
    // @Transient :  JPA가 이 필드를 DB 컬럼으로 간주하지 않게 함.
    @Transient
    private Boolean readByCurrentUser;
    
}
