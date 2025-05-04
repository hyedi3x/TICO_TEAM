package com.boot.tico.purchase.service;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

import com.boot.tico.erp.repo.EmpRepository;
import com.boot.tico.login.repository.UserRepository;
import com.boot.tico.purchase.dto.PurchaseLog;
import com.boot.tico.purchase.dto.PurchaseLogDTO;
import com.boot.tico.purchase.repo.PurchaseLogRepo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PurchaseLogService {

    private final PurchaseLogRepo purchaseLogRepo;
    private final EmpRepository empRepo;
    private final UserRepository userRepo;

    // 전체 로그 조회
    public List<PurchaseLogDTO> getAllLogsWithEmpNames() {
        List<PurchaseLog> logs = purchaseLogRepo.findAllByOrderByCreatedAtDesc();

        return logs.stream().map(log -> {
            String adminName = null;
            if (log.getEmpId() != null) {
                adminName = empRepo.findById(log.getEmpId())
                                   .map(emp -> emp.getEmpName())
                                   .orElse("삭제된 관리자");
            }
            String userName = userRepo.findById(log.getUserUuid())
            	    .map(user -> user.getName())
            	    .orElse("탈퇴한 회원");

            return PurchaseLogDTO.builder()
                    .logId(log.getLogId())
                    .userUuid(log.getUserUuid())
                    .transactionId(log.getTransactionId())
                    .productName(log.getProductName())
                    .subscriptionType(log.getSubscriptionType())
                    .durationDays(log.getDurationDays())
                    .amount(log.getAmount())
                    .payMethod(log.getPayMethod())
                    .paymentGateway(log.getPaymentGateway())
                    .status(log.getStatus())
                    .paymentCompletedAt(log.getPaymentCompletedAt())
                    .refundedAt(log.getRefundedAt())
                    .empId(log.getEmpId())
                    .empName(adminName)	// 관리자 이름
                    .userName(userName)	// 회원 이름
                    .createdAt(log.getCreatedAt())
                    .updatedAt(log.getUpdatedAt())
                    .build();
        }).collect(Collectors.toList());
    }
    
    // 검색 + 페이징 결합해서 반환
    public Page<PurchaseLogDTO> getLogsWithPaging(String keyword, int page, int size) {
    	Pageable pageable = PageRequest.of(page, size); 	// 최신순 정렬
        
        // 모든 로그 조회 (여기서는 키워드를 post-filtering)
        List<PurchaseLog> allLogs = purchaseLogRepo.findAll();

        // 변환 + 검색 필터 적용
        List<PurchaseLogDTO> filteredLogs = allLogs.stream()
            .map(log -> {
                String adminName = null;
                if (log.getEmpId() != null) {
                    adminName = empRepo.findById(log.getEmpId())
                                       .map(emp -> emp.getEmpName())
                                       .orElse("삭제된 관리자");
                }
                String userName = userRepo.findById(log.getUserUuid())
                        .map(user -> user.getName())
                        .orElse("탈퇴한 회원");

                return PurchaseLogDTO.builder()
                        .logId(log.getLogId())
                        .userUuid(log.getUserUuid())
                        .transactionId(log.getTransactionId())
                        .productName(log.getProductName())
                        .subscriptionType(log.getSubscriptionType())
                        .durationDays(log.getDurationDays())
                        .amount(log.getAmount())
                        .payMethod(log.getPayMethod())
                        .paymentGateway(log.getPaymentGateway())
                        .status(log.getStatus())
                        .paymentCompletedAt(log.getPaymentCompletedAt())
                        .refundedAt(log.getRefundedAt())
                        .empId(log.getEmpId())
                        .empName(adminName)	// 관리자 이름
                        .userName(userName)	// 회원 이름
                        .createdAt(log.getCreatedAt())
                        .updatedAt(log.getUpdatedAt())
                        .build();
            })
            .filter(dto -> 
                dto.getUserName().toLowerCase().contains(keyword.toLowerCase()) ||
                (dto.getEmpName() != null && dto.getEmpName().toLowerCase().contains(keyword.toLowerCase()))
            )
            .sorted((a, b) -> {
                // 최신순 정렬: 결제일이 있으면 결제일 기준, 없으면 createdAt 기준
                var dateA = a.getPaymentCompletedAt() != null ? a.getPaymentCompletedAt() : a.getCreatedAt();
                var dateB = b.getPaymentCompletedAt() != null ? b.getPaymentCompletedAt() : b.getCreatedAt();
                return dateB.compareTo(dateA); // 최신순
            })
            .collect(Collectors.toList());

        // 페이징 처리
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), filteredLogs.size());
        List<PurchaseLogDTO> pagedList = filteredLogs.subList(start, end);

        return new PageImpl<>(pagedList, pageable, filteredLogs.size());
    }
    
    // 엑셀 파일 생성
    public byte[] generatePurchaseLogsExcel() {
        List<PurchaseLogDTO> logs = getAllLogsWithEmpNames(); // 기존 메소드 활용

        try (Workbook workbook = new XSSFWorkbook()) {	// Workbook : 엑셀 파일의 기본 객체, XSSFWorkbook : .xlsx 파일 전용 워크북
            Sheet sheet = workbook.createSheet("Purchase Logs");

            // 1. 헤더
            Row headerRow = sheet.createRow(0);
            String[] headers = {"회원 이름", "회원 UUID", "관리자 이름", "관리자 emp_id", "상품명", "결제수단", "결제금액", "결제일", "환불여부", "환불일"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
            }

            // 2. 데이터 작성
            int rowIdx = 1;
            for (PurchaseLogDTO log : logs) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(log.getUserName() != null ? log.getUserName() : "-");
                row.createCell(1).setCellValue(log.getUserUuid() != null ? log.getUserUuid() : "-");
                row.createCell(2).setCellValue(log.getEmpName() != null ? log.getEmpName() : "-");
                row.createCell(3).setCellValue(log.getEmpId() != null ? log.getEmpId() : "-");
                row.createCell(4).setCellValue(log.getProductName() != null ? log.getProductName() : "-");
                row.createCell(5).setCellValue(
                    log.getPayMethod() != null && log.getPaymentGateway() != null
                        ? log.getPayMethod() + " (" + log.getPaymentGateway() + ")"
                        : "-"
                );
                row.createCell(6).setCellValue(log.getAmount() != null ? log.getAmount() : 0);
                row.createCell(7).setCellValue(log.getPaymentCompletedAt() != null ? log.getPaymentCompletedAt().toString() : "-");
                row.createCell(8).setCellValue("REFUNDED".equals(log.getStatus()) ? "환불됨" : "정상 결제");
                row.createCell(9).setCellValue(log.getRefundedAt() != null ? log.getRefundedAt().toString() : "-");
            }

            // 3. 엑셀 파일로 변환
            ByteArrayOutputStream out = new ByteArrayOutputStream();	// 메모리 상에서 엑셀 파일을 생성하는 스트림
            workbook.write(out);
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("엑셀 파일 생성 실패", e);
        }
    }
}