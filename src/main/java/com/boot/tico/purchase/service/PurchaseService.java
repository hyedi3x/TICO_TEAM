package com.boot.tico.purchase.service;

import com.boot.tico.login.entity.User;
import com.boot.tico.purchase.dto.PaymentVerifyRequest;
import com.boot.tico.purchase.dto.Purchase;
import com.boot.tico.purchase.dto.PurchaseLog;
import com.boot.tico.purchase.dto.SubscriptionResponseDTO;
import com.boot.tico.purchase.repo.PurchaseLogRepo;
import com.boot.tico.purchase.repo.PurchaseRepo;
import com.boot.tico.user.repository.UserListRepository;
import com.siot.IamportRestClient.IamportClient;
import com.siot.IamportRestClient.exception.IamportResponseException;
import com.siot.IamportRestClient.request.CancelData;
import com.siot.IamportRestClient.response.IamportResponse;
import com.siot.IamportRestClient.response.Payment;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class PurchaseService {

	private final UserListRepository userRepo;
    private final PurchaseRepo purchaseRepo;
    private final PurchaseLogRepo purchaseLogRepo;
    private final IamportClient iamportClient;

    /**
     * 아임포트 결제 완료 후 DB 저장
     * @param userUuid 유저 UUID
     * @param payment 아임포트 결제 응답 객체
     * @return 저장된 이용권 정보
     */
    public Purchase processPaymentDone(PaymentVerifyRequest request, Payment payment) {
        // 1. 이용권 상태 저장 (user_subscription)
        LocalDateTime startDate = LocalDateTime.now();
        LocalDateTime endDate = startDate.plusDays(request.getDurationDays());

        // 1. user_subscription 저장
        Purchase subscription = Purchase.builder()
                .userUuid(request.getUserUuid())
                .startDate(startDate)
                .endDate(endDate)
                .active(true)
                .subscriptionType(request.getSubscriptionType())
                .transactionId(payment.getImpUid())
                .build();
        purchaseRepo.save(subscription); // 먼저 저장

        // 2. 결제 로그 저장 (purchase_log)
        PurchaseLog log = PurchaseLog.builder()
                .userUuid(request.getUserUuid())
                .transactionId(payment.getImpUid())
                .subscriptionType(request.getSubscriptionType())
                .productName(request.getProductName())
                .durationDays(request.getDurationDays())
                .status(payment.getStatus()) // 보통 paid
                .amount(payment.getAmount().intValue())
                .payMethod(payment.getPayMethod())
                .paymentGateway(payment.getPgProvider())
                .paymentCompletedAt(toLocalDateTime(payment.getPaidAt()))
                .build();
        purchaseLogRepo.save(log); // 로그 저장도 추가

        return subscription;
    }
    
    /* 
     * Date -> LocalDateTime을 변환하는 메서드
     * payment.getPaidAt()이 java.util.Date 타입인데,
     * toLocalDateTime(Long) 메서드는 Long (epoch seconds) 를 받도록 되어 있어서 타입이 안 맞는다. 
    */
    private LocalDateTime toLocalDateTime(Date date) {
        return date.toInstant()
                   .atZone(ZoneId.of("Asia/Seoul"))
                   .toLocalDateTime();
    }

    /**
     * 마이페이지 이용권 정보 조회
     * @param userUuid 사용자 UUID
     * @return 이용권 상태 응답 DTO
     */
    public SubscriptionResponseDTO getSubscriptionInfo(String userUuid) {
        Purchase p = purchaseRepo.findById(userUuid)
                .orElseThrow(() -> new RuntimeException("이용권이 존재하지 않습니다."));

        String name = userRepo.findById(userUuid)
                .map(user -> user.getName())
                .orElse("탈퇴한 사용자");
        
        LocalDate now = LocalDate.now();
        long remainingDays = ChronoUnit.DAYS.between(now, p.getEndDate().toLocalDate());
        boolean expired = remainingDays <= 0;

        return SubscriptionResponseDTO.builder()
                .active(p.isActive())
                .subscriptionType(p.getSubscriptionType())
                .startDate(p.getStartDate().toLocalDate())
                .endDate(p.getEndDate().toLocalDate())
                .remainingDays(Math.max(remainingDays, 0))
                .expired(expired)
                .name(name)
                .transactionId(p.getTransactionId())
                .build();
    }
    
    // 전체 이용권 목록 (관리자용)
    public List<Purchase> getAllSubscriptions() {
        return purchaseRepo.findAll();
    }
    
    // 전체 이용권 목록 / 검색 + 페이징 (관리자용)
    public Page<SubscriptionResponseDTO> getSubscriptionPage(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        // 🔹 purchase 기준으로 active이고, 유저 이름에 keyword가 포함된 것만 조회
        Page<Purchase> purchasePage = purchaseRepo.findActiveWithUser(keyword, pageable);

        // 🔹 DTO 변환
        List<SubscriptionResponseDTO> dtoList = purchasePage.stream().map(p -> {
            User user = p.getUser(); // join fetch 덕분에 N+1 문제 없음
            LocalDate now = LocalDate.now();
            long remainingDays = ChronoUnit.DAYS.between(now, p.getEndDate().toLocalDate());

            return SubscriptionResponseDTO.builder()
                    .name(user.getName())
                    .nickname(user.getNickname())
                    .startDate(p.getStartDate().toLocalDate())
                    .endDate(p.getEndDate().toLocalDate())
                    .active(p.isActive())
                    .subscriptionType(p.getSubscriptionType())
                    .remainingDays(Math.max(remainingDays, 0))
                    .expired(remainingDays <= 0)
                    .transactionId(p.getTransactionId())
                    .build();
        }).toList();

        return new PageImpl<>(dtoList, pageable, purchasePage.getTotalElements());
    }


    // 결제건 환불 처리 (관리자용)
    public Purchase refundByImpUid(String impUid, String empId) throws IamportResponseException, IOException {
        
    	// 1. 아임포트 환불 요청
    	CancelData cancelData = new CancelData(impUid, true); // impUid, 환불 전액 여부
        IamportResponse<Payment> response = iamportClient.cancelPaymentByImpUid(cancelData);

        if (response.getResponse() == null || !"cancelled".equals(response.getResponse().getStatus())) {
            throw new RuntimeException("환불 실패: 아임포트 상태 확인 필요");
        }

        // 2. DB 내 Purchase 비활성화 처리. user_subscription 비활성화
        // user_subscription 수정
        Purchase purchase = purchaseRepo.findAll().stream()
            .filter(p -> impUid.equals(p.getTransactionId()))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("DB에 해당 결제 기록 없음"));

        purchase.setActive(false);
        purchase.setEndDate(LocalDateTime.now());
        purchaseRepo.save(purchase);

        // 3. purchase_log 수정
        PurchaseLog log = purchaseLogRepo.findAll().stream()
            .filter(l -> impUid.equals(l.getTransactionId()))
            .findFirst()
            .orElse(null);

        if (log != null) {
            log.setStatus("REFUNDED");
            log.setRefundedAt(LocalDateTime.now());
            log.setEmpId(empId); // ✅ 정수형 ID 저장
            purchaseLogRepo.save(log);
        }
        return purchase;
    }

    // 특정 impUid로 단건 이용권 조회
    public Purchase getSubscriptionByImpUid(String impUid) {
        return purchaseRepo.findAll().stream()
                .filter(p -> impUid.equals(p.getTransactionId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("해당 결제 기록이 없습니다."));
    }
}
