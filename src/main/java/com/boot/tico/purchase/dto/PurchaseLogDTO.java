package com.boot.tico.purchase.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseLogDTO {
    private Long logId;
    private String userUuid;
    private String transactionId;
    private String subscriptionType;
    private String productName;
    private Integer durationDays;
    private String status;
    private Integer amount;
    private String payMethod;
    private String paymentGateway;
    private LocalDateTime paymentCompletedAt;
    private LocalDateTime refundedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String empId;
    private String empName;	// 관리자 이름
    private String userName;	// 사용자 이름
}