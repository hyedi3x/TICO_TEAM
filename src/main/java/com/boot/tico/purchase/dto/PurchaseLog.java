package com.boot.tico.purchase.dto;

import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "purchase_log")
public class PurchaseLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id", nullable = false, length = 36)
    private Long logId;

    @Column(name = "user_uuid", nullable = false, length = 36)
    private String userUuid;

    @Column(name = "transaction_id", unique = true, length = 100)
    private String transactionId;

    @Column(name = "subscription_type", length = 50)
    private String subscriptionType;

    @Column(name = "product_name", length = 100)
    private String productName;
    
    @Column(name = "duration_days")
    private Integer durationDays;

    @Column(name = "status", length = 20)
    private String status; // PAID, REFUNDED, FAILED 등

    @Column(name = "amount", nullable = false)
    private Integer amount;

    @Column(name = "pay_method", length = 20)
    private String payMethod;

    @Column(name = "payment_gateway", length = 30)
    private String paymentGateway;

    @Column(name = "payment_completed_at")
    private LocalDateTime paymentCompletedAt;

    @Column(name = "refunded_at")
    private LocalDateTime refundedAt;

    @Column(name = "emp_id")
    private String empId; // 관리자 UUID

    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

}
