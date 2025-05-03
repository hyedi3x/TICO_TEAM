package com.boot.tico.erp.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.boot.tico.erp.dto.UserNotification;
import com.boot.tico.erp.dto.UserNotificationRequest;
import com.boot.tico.erp.service.UserNotificationService;
import com.boot.tico.project.dto.ProjectReportDTO;
import com.boot.tico.project.repo.ProjectReportRepository;
import com.boot.tico.project.repo.ProjectRepository;

import lombok.RequiredArgsConstructor;

// user 알림 컨트롤러
@RestController
@RequestMapping("/api/user-notification")
@RequiredArgsConstructor
public class UserNotificationController {
	
	private final UserNotificationService service;
	
	private final ProjectReportRepository projectReportRepo;
	private final ProjectRepository projectRepo;
	
	@PostMapping("/send")
    public ResponseEntity<String> sendNotification(@RequestBody UserNotificationRequest request) {
		service.sendNotification(request);
        return ResponseEntity.ok("알림 전송 완료");
    }
	
	@PostMapping("/send-from-report/{reportId}")
	public ResponseEntity<String> sendFromReport(@PathVariable Integer reportId) {
	    ProjectReportDTO report = projectReportRepo.findById(reportId)
	        .orElseThrow(() -> new RuntimeException("해당 신고 없음"));

	    // 프로젝트 제작자 UUID를 얻는 방식
	    String projectAuthorUuid = projectRepo.findAuthorByProjectId(report.getProjectId());
	    service.sendReportNotification(report, projectAuthorUuid);
	    return ResponseEntity.ok("신고 알림 전송 완료");
	}

    @GetMapping("/{userUuid}")
    public ResponseEntity<List<UserNotification>> getUserNotifications(@PathVariable String userUuid) {
        return ResponseEntity.ok(service.getUserNotifications(userUuid));
    }

    @PostMapping("/read/{notificationId}")
    public ResponseEntity<Void> markAsRead(@PathVariable Long notificationId) {
    	service.markAsRead(notificationId);
        return ResponseEntity.ok().build();
    }
    
    // 개별 알림 삭제 
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long notificationId) {
        service.deleteNotification(notificationId);
        return ResponseEntity.ok().build();
    }
    
    // 모든 알림 삭제
    @DeleteMapping("/all/{userUuid}")
    public ResponseEntity<Void> deleteAllNotifications(@PathVariable String userUuid) {
        service.deleteAllNotifications(userUuid);
        return ResponseEntity.ok().build();
    }

}
