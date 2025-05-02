package com.boot.tico.erp.repo;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.boot.tico.erp.dto.ErpScheduleDTO;
import com.boot.tico.erp.dto.Notification;

@Repository
public interface NotificationRepo extends JpaRepository<Notification, Long>{
	
	// 특정 사용자의 안 읽은 알림
    List<Notification> findByEmpIdAndIsReadFalseOrderByCreatedAtDesc(String empId);

    // 특정 사용자의 전체 알림
    List<Notification> findByEmpIdOrderByCreatedAtDesc(String empId);
    
    // 중복알림 체크용
    boolean existsByRelatedTypeAndRelatedIdAndEmpId(String relatedType, Long relatedId, String empId);

}
