package com.boot.tico.erp.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserNotificationRequest {
	private String userUuid;	// 알림 받을 사용자 UUID
    private String title;		// 알림 제목
    private String content;		// 알림 내용
    
    // 추가
    private Long projectId;		// 신고당한 프로젝트 아이디
    private String reason;		// 사유
}
