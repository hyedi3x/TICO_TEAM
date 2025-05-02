package com.boot.tico.erp.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.boot.tico.erp.dto.ErpNotiDTO;
import com.boot.tico.erp.dto.ErpScheduleDTO;
import com.boot.tico.erp.dto.Notification;
import com.boot.tico.erp.dto.NotificationDismissed;
import com.boot.tico.erp.dto.NotificationRead;
import com.boot.tico.erp.repo.ErpNotiRepository;
import com.boot.tico.erp.repo.ErpScheduleRepository;
import com.boot.tico.erp.repo.NotificationDismissedRepo;
import com.boot.tico.erp.repo.NotificationReadRepo;
import com.boot.tico.erp.repo.NotificationRepo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {

    @Autowired
    private NotificationRepo notificationRepo;
    
    @Autowired
    private ErpNotiRepository erpNotiRepo;
    
    @Autowired
    private ErpScheduleRepository erpScheduleRepo;
    
    @Autowired
    private NotificationReadRepo readRepo;
    
    @Autowired
    private NotificationDismissedRepo dismissedRepo;

    // (1) 내 전체 알림 조회
    public List<Notification> getAllNotifications(String empId) {
    	List<Notification> personal = notificationRepo.findByEmpIdOrderByCreatedAtDesc(empId);
        List<Notification> global = notificationRepo.findByEmpIdOrderByCreatedAtDesc("ALL");
        
        // 💡 공용 알림 중에서, 삭제 안 된 것만 필터링
        global = global.stream()
            .filter(noti -> !dismissedRepo.existsByNotificationIdAndEmpId(noti.getNotificationId(), empId))
            .collect(Collectors.toList());
        
        List<Notification> all = new ArrayList<>();
        all.addAll(personal);
        all.addAll(global);

        // 최신순 정렬
        all.sort(Comparator.comparing(Notification::getCreatedAt).reversed());
        
        // 각 global 알림에 대해 readByCurrentUser 필드 주입
        all.forEach(noti -> {
            if ("ALL".equals(noti.getEmpId())) {
                boolean isRead = readRepo.existsByNotificationIdAndEmpId(noti.getNotificationId(), empId);
                noti.setReadByCurrentUser(isRead);  // 👉 커스텀 필드
            }
        });
        return all;
    }

    // (2) 내 안 읽은 알림 조회
    public List<Notification> getUnreadNotifications(String empId) {
    	List<Notification> personal = notificationRepo.findByEmpIdAndIsReadFalseOrderByCreatedAtDesc(empId);
        List<Notification> global = notificationRepo.findByEmpIdAndIsReadFalseOrderByCreatedAtDesc("ALL");

        List<Notification> unread = new ArrayList<>();
        unread.addAll(personal);
        unread.addAll(global);

        unread.sort(Comparator.comparing(Notification::getCreatedAt).reversed());

        return unread;
    }

    // (3) 알림 읽음 처리
    public boolean markAsRead(Long notificationId, String empId) {
    	// 이미 읽은 기록이 있으면 종료
        if (readRepo.existsByNotificationIdAndEmpId(notificationId, empId)) {
        	return false;
        }
        // 읽음 기록 저장
        NotificationRead read = new NotificationRead();
        read.setNotificationId(notificationId);
        read.setEmpId(empId);
        readRepo.save(read);
        
        // 개인 알림이면 is_read 필드도 업데이트
        Notification noti = notificationRepo.findById(notificationId).orElse(null);
        if (noti != null && !noti.getEmpId().equals("ALL")) {
            noti.setIsRead(true);
            notificationRepo.save(noti);
        }
        return true;
    }
    
 // ✔️ 글로벌 알림 안 읽은 것만 가져오기
    public List<Notification> getUnreadGlobalNotifications(String empId) {
        List<Notification> allGlobal = notificationRepo.findByEmpIdOrderByCreatedAtDesc("ALL");
        return allGlobal.stream()
            .filter(n -> !readRepo.existsByNotificationIdAndEmpId(n.getNotificationId(), empId))
            .toList();
    }

    // (4) 알림 삭제
    public boolean deleteNotification(Long notificationId, String empId) {
        Notification noti = notificationRepo.findById(notificationId).orElse(null);
        if (noti == null) return false;

        if ("ALL".equals(noti.getEmpId())) {
            // 공용 알림이면 삭제 이력만 남긴다
            NotificationDismissed dismissed = new NotificationDismissed(notificationId, empId);
            dismissedRepo.save(dismissed);
        } else if (empId.equals(noti.getEmpId())) {
            // 개인 알림이면 실제 삭제
            notificationRepo.delete(noti);
        }
        return true;
    }
    
    // (5) 전체 알림 삭제 (개인 + 공용 삭제 이력 기록)
    public void deleteAllNotifications(String empId) {
        List<Notification> all = getAllNotifications(empId);  // 개인 + 공용 필터링 포함된 알림

        for (Notification noti : all) {
            if ("ALL".equals(noti.getEmpId())) {
                // 공용 알림은 숨김 처리
                if (!dismissedRepo.existsByNotificationIdAndEmpId(noti.getNotificationId(), empId)) {
                    dismissedRepo.save(new NotificationDismissed(noti.getNotificationId(), empId));
                }
            } else if (empId.equals(noti.getEmpId())) {
                // 개인 알림은 직접 삭제
                notificationRepo.delete(noti);
            }
        }
    }

    // 공용 알림 삭제
    public void dismissGlobalNotification(Long notificationId, String empId) {
        NotificationDismissed dismissed = new NotificationDismissed(notificationId, empId);
        dismissedRepo.save(dismissed);
    }
    
    // (6) 매일 자정마다 공지사항/일정 만료 하루 전 알림 생성
    @Scheduled(cron = "0 0 0 * * *")
    public void generateDailyExpiryNotifications() {
        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);   // 내일 날짜

        // 1. 내일 만료되는 공지사항 조회
        List<ErpNotiDTO> expiringNotices = erpNotiRepo.findByErpNotiExpiredAt(tomorrow);
        for (ErpNotiDTO notice : expiringNotices) {
        	boolean exists = notificationRepo.existsByRelatedTypeAndRelatedIdAndEmpId("notice", notice.getErpNotiId(), "ALL");
        	if (!exists) {
            Notification notification = new Notification();
            notification.setEmpId("ALL");   // 모든 관리자 공용 알림
            notification.setNotificationTitle("[공지] 만료 예정: " + notice.getErpNotiTitle());
            notification.setNotificationMessage("등록한 공지사항이 내일 만료됩니다.");
            notification.setRelatedType("notice");
            notification.setRelatedId(notice.getErpNotiId());
            notification.setLinkUrl("/noticeDetail/" + notice.getErpNotiId());  // 이동할 링크
            notificationRepo.save(notification);
        }
       }

        // 2. 내일 만료되는 일정 조회
        List<ErpScheduleDTO> expiringSchedules = erpScheduleRepo.findByErpScheduleEndBetween(
            tomorrow.atStartOfDay(),
            tomorrow.plusDays(1).atStartOfDay()
        );
        for (ErpScheduleDTO schedule : expiringSchedules) {
            Notification notification = new Notification();
            notification.setEmpId(schedule.getEmpId());
            notification.setNotificationTitle("[일정] 마감 예정: " + schedule.getErpScheduleTitle());
            notification.setNotificationMessage("등록한 일정이 내일 종료됩니다.");
            notification.setRelatedType("schedule");
            notification.setRelatedId(schedule.getErpScheduleId());
            notification.setLinkUrl("/scheduleDetail/" + schedule.getErpScheduleId());	// 이동할 링크
            notificationRepo.save(notification);
        }

        System.out.println("만료 예정 알림 생성 완료");
    }
}
