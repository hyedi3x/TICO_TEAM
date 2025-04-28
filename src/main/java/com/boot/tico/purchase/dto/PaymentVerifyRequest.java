package com.boot.tico.purchase.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 클라이언트에서 전달된 요청 본문 객체
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentVerifyRequest {
    private String userUuid;
    private String subscriptionType;  // 예: "premium"
    private String productName;       // 예: "프리미엄 이용권 30일"
    private Integer durationDays;     // 예: 30
}