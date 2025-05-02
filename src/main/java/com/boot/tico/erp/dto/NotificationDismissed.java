package com.boot.tico.erp.dto;

import java.io.Serializable;
import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.IdClass;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor	// 모든 필드를 포함한 생성자를 생성하기 때문에 / new NotificationDismissed(notificationId, empId) 이런 식으로 두 개의 파라미터만 주는 생성자는 존재하지 않게 된다.
@Entity
@IdClass(NotificationDismissedId.class)
@Table(name = "notification_dismissed")
public class NotificationDismissed implements Serializable {

	private static final long serialVersionUID = 1L;
	
    @Id
    @Column(name = "notification_id")
    private Long notificationId;

    @Id
    @Column(name = "emp_id")
    private String empId;

    @Column(name = "dismissed_at")
    private LocalDateTime dismissedAt = LocalDateTime.now();
    
    // 두 파라미터 생성자 추가
    public NotificationDismissed(Long notificationId, String empId) {
        this.notificationId = notificationId;
        this.empId = empId;
        this.dismissedAt = LocalDateTime.now();
    }
}