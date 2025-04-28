package com.boot.tico.purchase.repo;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.boot.tico.purchase.dto.PurchaseLog;

public interface PurchaseLogRepo extends JpaRepository<PurchaseLog, Long>{
	List<PurchaseLog> findAllByOrderByCreatedAtDesc();
	
	// userUuid + status 기준으로 최근 결제 완료 내역 하나만 찾기
    PurchaseLog findTopByUserUuidAndStatusOrderByPaymentCompletedAtDesc(String userUuid, String status);
}
