package com.boot.tico.purchase.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
// 활성화 회원 페이지
public class SubscriptionResponseDTO {
	private boolean active;
	private String subscriptionType;
	private LocalDate startDate;
	private LocalDate endDate;
	private long remainingDays;
	private boolean expired;
	
	private String name;	// 회원 이름

    private String transactionId;
}
