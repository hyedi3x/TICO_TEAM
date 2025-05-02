package com.boot.tico.erp.repo;

import com.boot.tico.erp.dto.NotificationRead;
import com.boot.tico.erp.dto.NotificationReadId;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NotificationReadRepo extends JpaRepository<NotificationRead, NotificationReadId> {
    boolean existsByNotificationIdAndEmpId(Long notificationId, String empId);
    Optional<NotificationRead> findByNotificationIdAndEmpId(Long notificationId, String empId);
}
