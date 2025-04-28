package com.boot.tico.purchase.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReceiptResponseDTO {
    private String orderId;       // 주문번호 (transactionId)
    private String productName;   // 상품명
    private LocalDateTime paymentDate; // 결제일시
    private int amount;           // 결제금액
    private String payMethod;     // 결제수단 (kakaopay 등)
    private String status;        // 결제상태 (paid, refunded 등)
}