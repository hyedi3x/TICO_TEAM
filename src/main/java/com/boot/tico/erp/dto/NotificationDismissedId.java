package com.boot.tico.erp.dto;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * 복합키 식별자 클래스
 * - 반드시 Serializable 구현
 * - equals() & hashCode() 필수
 */
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class NotificationDismissedId implements Serializable {
	
    private Long notificationId;
    private String empId;
}
