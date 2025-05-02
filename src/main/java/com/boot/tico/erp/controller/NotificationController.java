package com.boot.tico.erp.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.boot.tico.erp.dto.Notification;
import com.boot.tico.erp.service.NotificationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService service;

    //(1) 내 전체 알림 조회
    @GetMapping("/{empId}")
    public ResponseEntity<List<Notification>> getAllNotifications(@PathVariable String empId) {
        List<Notification> notifications = service.getAllNotifications(empId);
        return ResponseEntity.ok(notifications);
    }

    // (2) 내 읽지 않은 알림만 조회
    @GetMapping("/unread/{empId}")
    public ResponseEntity<List<Notification>> getUnreadNotifications(@PathVariable String empId) {
        List<Notification> notifications = service.getUnreadNotifications(empId);
        return ResponseEntity.ok(notifications);
    }

    // (3) 특정 알림 읽음 처리
    @PostMapping("/read/{notificationId}/{empId}")
    public ResponseEntity<String> markNotificationAsRead(@PathVariable Long notificationId, @PathVariable String empId) {
    	System.out.println("📥 읽음 요청 도착 - 알림 ID: " + notificationId + ", 사원 ID: " + empId);
    	
    	boolean success = service.markAsRead(notificationId, empId);
    	return ResponseEntity.ok("알림 읽음 처리 완료"); // ✔️ 무조건 200 반환
    }

    // (4) 특정 알림 삭제
    @DeleteMapping("/delete/{notificationId}/{empId}")
    public ResponseEntity<String> deleteNotification(@PathVariable Long notificationId, @PathVariable String empId) {
    	boolean success = service.deleteNotification(notificationId, empId);
        if (success) {
            return ResponseEntity.ok("알림 삭제 완료");
        } else {
            return ResponseEntity.badRequest().body("알림 삭제 실패");
        }
    }
    
    // (5) 전체 알림 삭제 (개인 + 공용 삭제 이력 기록)
    @DeleteMapping("/deleteAll/{empId}")
    public ResponseEntity<String> deleteAllNotifications(@PathVariable String empId) {
        service.deleteAllNotifications(empId);
        return ResponseEntity.ok("전체 알림 삭제 완료");
    }
    
    // 공용 알림 삭제(안보이게)
    @PostMapping("/dismiss/{notificationId}/{empId}")
    public ResponseEntity<String> dismissGlobalNotification(@PathVariable Long notificationId, @PathVariable String empId) {
        service.dismissGlobalNotification(notificationId, empId);
        return ResponseEntity.ok("공용 알림 숨김 처리 완료");
    }
    
    

}
