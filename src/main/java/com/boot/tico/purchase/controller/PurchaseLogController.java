package com.boot.tico.purchase.controller;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.boot.tico.purchase.dto.PurchaseLogDTO;
import com.boot.tico.purchase.service.PurchaseLogService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/purchase")
@RequiredArgsConstructor
public class PurchaseLogController {

    private final PurchaseLogService service;

    // 결제 로그 조회 (검색 + 페이징)
    // /api/purchase/logs?keyword=검색어&page=1&size=10
    @GetMapping("/logs")
    public ResponseEntity<Page<PurchaseLogDTO>> getLogs(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(service.getLogsWithPaging(keyword, page - 1, size)); // 프론트는 1페이지부터 시작, Spring PageRequest는 0부터 시작임. 
    }
    
    // 엑셀 다운로드 API 만들기
    @GetMapping("/logs/download")
    public ResponseEntity<byte[]> downloadPurchaseLogsExcel() {
        byte[] excelFile = service.generatePurchaseLogsExcel(); // 서비스에서 파일 생성
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=purchase_logs.xlsx")
                .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .body(excelFile);
    }
}
