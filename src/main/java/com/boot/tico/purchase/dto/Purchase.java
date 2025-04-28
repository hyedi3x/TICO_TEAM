package com.boot.tico.purchase.dto;

import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name="user_subscription")
public class Purchase {
	@Id
    @Column(name = "user_uuid", length = 36)
    private String userUuid;  // FK: users 테이블

    @Column(name = "active", nullable = false)
    private boolean active = false;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "subscription_type", nullable = false)
    private String subscriptionType = "basic";
    
    @Column(name = "transaction_id", unique = true)
    private String transactionId; // 추가: 결제 고유 ID

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate		// 수정시 updateAt 갱신
    public void setUpdatedAt() {
        this.updatedAt = LocalDateTime.now();
    }
}
