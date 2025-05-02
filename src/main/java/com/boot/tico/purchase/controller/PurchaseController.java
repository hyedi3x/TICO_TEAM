package com.boot.tico.purchase.controller;

import com.boot.tico.purchase.dto.PaymentVerifyRequest;
import com.boot.tico.purchase.dto.Purchase;
import com.boot.tico.purchase.dto.PurchaseLog;
import com.boot.tico.purchase.dto.ReceiptResponseDTO;
import com.boot.tico.purchase.dto.RefundRequest;
import com.boot.tico.purchase.dto.SubscriptionResponseDTO;
import com.boot.tico.purchase.repo.PurchaseLogRepo; // 로그 Repo
import com.boot.tico.purchase.service.PurchaseService;
import com.siot.IamportRestClient.IamportClient;
import com.siot.IamportRestClient.exception.IamportResponseException;
import com.siot.IamportRestClient.response.IamportResponse;
import com.siot.IamportRestClient.response.Payment;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/purchase")
@RequiredArgsConstructor
public class PurchaseController {

    private final PurchaseService service;
    private final PurchaseLogRepo purchaseLogRepo;
    private IamportClient iamportClient;

    @Value("${imp.api.key}")
    private String apiKey;

    @Value("${imp.api.secret}")
    private String apiSecret;

    @PostConstruct
    public void init() {
        this.iamportClient = new IamportClient(apiKey, apiSecret);
    }

    /**
     * 아임포트 결제 검증 후 DB 저장
     */
    @PostMapping("/verify/{imp_uid}")
    public ResponseEntity<?> verifyIamport(@PathVariable("imp_uid") String impUid,
                                           @RequestBody PaymentVerifyRequest request) {
        try {
            IamportResponse<Payment> iamportResponse = iamportClient.paymentByImpUid(impUid);
            log.info("아임포트 결제 응답: 주문번호={}, 금액={}, 상태={}",
                    iamportResponse.getResponse().getMerchantUid(),
                    iamportResponse.getResponse().getAmount(),
                    iamportResponse.getResponse().getStatus());

            Purchase saved = service.processPaymentDone(request, iamportResponse.getResponse());
            return ResponseEntity.ok(saved);

        } catch (IamportResponseException | IOException e) {
            log.error("❌ 결제 검증 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("결제 검증 중 오류: " + e.getMessage());
        }
    }

    // 사용자 이용권 정보 조회
    @GetMapping("/{userUuid}")
    public ResponseEntity<?> getSubscription(@PathVariable String userUuid) {
        try {
            return ResponseEntity.ok(service.getSubscriptionInfo(userUuid));
        } catch (Exception e) {
            log.error("❌ 이용권 정보 조회 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("이용권 정보를 조회할 수 없습니다.");
        }
    }
    
    // 특정 결제건 영수증 URL 반환 (마이페이지용)
    // 포트원 서버에 직접 요청에서 응답받음. 영수증 URL (https://receipt.iamport.kr/...)을 응답으로 준다.
    @GetMapping("/receipt/{impUid}")
    public ResponseEntity<?> getReceiptUrl(@PathVariable String impUid) {
        try {
            IamportResponse<Payment> response = iamportClient.paymentByImpUid(impUid);
            if (response.getResponse() == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("영수증을 찾을 수 없습니다.");
            }

            String receiptUrl = response.getResponse().getReceiptUrl();
            return ResponseEntity.ok(receiptUrl);

        } catch (IamportResponseException | IOException e) {
            log.error("❌ 영수증 조회 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("영수증 조회 중 오류 발생: " + e.getMessage());
        }
    }

    // 전체 이용권 목록 (관리자용)
    @GetMapping("/all")
    public ResponseEntity<List<Purchase>> getAllSubscriptions() {
        try {
            return ResponseEntity.ok(service.getAllSubscriptions());
        } catch (Exception e) {
            log.error("❌ 전체 이용권 조회 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // 이름 기반 검색 + 페이징 조회 (관리자용)
    @GetMapping("/page")
    public ResponseEntity<?> getPagedSubscriptions(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            // 프론트는 1부터 시작하지만, Spring의 PageRequest는 0부터 시작
            Page<SubscriptionResponseDTO> result = service.getSubscriptionPage(keyword, page - 1, size);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("❌ 이용권 페이징 조회 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("이용권 페이지 정보를 가져오는 데 실패했습니다.");
        }
    }

    // 특정 이용권 환불 요청 (관리자용) 실제 결제가 가능할 때 사용가능.
    @PostMapping("/refund/{impUid}")
    public ResponseEntity<?> refundPayment(@PathVariable String impUid, @RequestBody RefundRequest request) {
        try {
            service.refundByImpUid(impUid, request.getEmpId());
            return ResponseEntity.ok().build();		// 반환은 아무것도 안 주거나 메시지만
        } catch (Exception e) {
            log.error("❌ 환불 처리 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("환불 처리 중 오류 발생: " + e.getMessage());
        }
    }
    
 // 영수증 데이터 조회 (마이페이지 모달용)
    @GetMapping("/receipt-data/{userUuid}")
    public ResponseEntity<?> getReceiptData(@PathVariable String userUuid) {
        try {
            // 최근 결제 완료(PAID)된 결제 건 1건 찾기
            PurchaseLog latestPayment = purchaseLogRepo.findTopByUserUuidAndStatusOrderByPaymentCompletedAtDesc(userUuid, "paid");

            if (latestPayment == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("결제 기록을 찾을 수 없습니다.");
            }

            // 필요한 데이터만 추려서 보내기
            ReceiptResponseDTO receipt = ReceiptResponseDTO.builder()
                    .orderId(latestPayment.getTransactionId())
                    .productName(latestPayment.getProductName())
                    .paymentDate(latestPayment.getPaymentCompletedAt())
                    .amount(latestPayment.getAmount())
                    .payMethod(latestPayment.getPayMethod())
                    .status(latestPayment.getStatus())
                    .build();

            return ResponseEntity.ok(receipt);

        } catch (Exception e) {
            log.error("❌ 영수증 데이터 조회 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("영수증 데이터를 조회하는 중 오류 발생: " + e.getMessage());
        }
    }
} 
