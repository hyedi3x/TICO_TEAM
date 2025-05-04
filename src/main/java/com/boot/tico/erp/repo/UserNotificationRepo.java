package com.boot.tico.erp.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.boot.tico.erp.dto.UserNotification;

// 사용자 알림 레포지토리
public interface UserNotificationRepo extends JpaRepository<UserNotification, Long>{
	
	List<UserNotification> findByUserUuidOrderByCreatedAtDesc(String userUuid);

	@Modifying
	@Query("DELETE FROM UserNotification u WHERE u.userUuid = :userUuid")
	void deleteByUserUuid(@Param("userUuid") String userUuid);
}
