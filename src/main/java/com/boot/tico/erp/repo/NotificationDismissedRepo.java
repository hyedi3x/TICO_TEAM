package com.boot.tico.erp.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.boot.tico.erp.dto.NotificationDismissed;
import com.boot.tico.erp.dto.NotificationDismissedId;

public interface NotificationDismissedRepo extends JpaRepository<NotificationDismissed, NotificationDismissedId> {
    boolean existsByNotificationIdAndEmpId(Long notificationId, String empId);
}
