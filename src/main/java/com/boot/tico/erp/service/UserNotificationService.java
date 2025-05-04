package com.boot.tico.erp.service;

import java.util.List;

import javax.transaction.Transactional;

import org.springframework.stereotype.Service;

import com.boot.tico.erp.dto.UserNotification;
import com.boot.tico.erp.dto.UserNotificationRequest;
import com.boot.tico.erp.repo.UserNotificationRepo;
import com.boot.tico.project.dto.ProjectReportDTO;

import lombok.RequiredArgsConstructor;

// user 알림 서비스
@Service
@RequiredArgsConstructor
@Transactional
public class UserNotificationService {
	
	private final UserNotificationRepo repo;

	// 알림 내용 보내기
    public void sendNotification(UserNotificationRequest request) {
    	String dynamicContent = request.getContent();
        if (request.getProjectId() != null && request.getReason() != null) {
            dynamicContent += "\n\n신고된 작품 ID: " + request.getProjectId()
                    + "\n신고 사유: " + request.getReason();
        }

        UserNotification noti = UserNotification.builder()
                .userUuid(request.getUserUuid())
                .title(request.getTitle())
                .content(dynamicContent)
                .isRead(false)
                .build();

        repo.save(noti);
        System.out.println(" 알림 저장 완료: " + noti);
    }
    
    // 신고 내용 보내기
    public void sendReportNotification(ProjectReportDTO report, String authorUuid) {
        String content = String.format(
            "회원님의 작품(ID: %d)에 대해 다음과 같은 사유로 신고가 접수되었습니다:\n%s",
            report.getProjectId(),
            report.getReason()
        );

        UserNotification noti = UserNotification.builder()
            .userUuid(authorUuid)
            .title("신고 알림")
            .content(content)
            .projectId(report.getProjectId())
            .isRead(false)
            .build();

        repo.save(noti);
    }

    // 알림 목록 불러오기
    public List<UserNotification> getUserNotifications(String userUuid) {
        List<UserNotification> result = repo.findByUserUuidOrderByCreatedAtDesc(userUuid);
        System.out.println("조회된 알림 수: " + result.size());
        return result;
    }


    public void markAsRead(Long notificationId) {
    	repo.findById(notificationId).ifPresent(noti -> {
            noti.setIsRead(true);
            repo.save(noti);
        });
    }
    
    // 개별 알림 삭제
    public void deleteNotification(Long notificationId) {
        repo.deleteById(notificationId);
    }

    // 특정 유저의 전체 알림 삭제
    public void deleteAllNotifications(String userUuid) {
        try {
            repo.deleteByUserUuid(userUuid);
        } catch (Exception e) {
            System.err.println("❌ 전체 삭제 실패: " + e.getMessage());
            e.printStackTrace();
        }
    }


}
