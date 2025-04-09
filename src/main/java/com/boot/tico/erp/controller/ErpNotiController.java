package com.boot.tico.erp.controller;

import com.boot.tico.erp.dto.EmpDTO;
import com.boot.tico.erp.dto.ErpNotiDTO;
import com.boot.tico.erp.service.ErpNotiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.sql.Date;
import java.util.List;

@RestController
@RequestMapping("/api/notices")
public class ErpNotiController {

    @Autowired
    private ErpNotiService notiService;

    // 관리자 회원 정보 단건 조회
    @GetMapping("/employee/{empId}")
    public ResponseEntity<EmpDTO> getEmpInfo(@PathVariable String empId) {
        EmpDTO emp = notiService.getEmployeeById(empId);
        if (emp != null) {
            return ResponseEntity.ok(emp);		// HTTP 200 + body에 emp 반환
        } else {
            return ResponseEntity.notFound().build();	 // HTTP 404 반환
        }
    }
    
    // ID 기준 단건 조회
    @GetMapping("/notice/{id}")
    public ErpNotiDTO getNoticeById(@PathVariable Long id) {	
        return notiService.getComNotiById(id);
    }

    /**
     * 공지사항 목록 검색 + 페이징
     * - 검색어(keyword), 검색 타입(title/content/titleAndContent), 카테고리, 상태 조건 가능
     * - Pageable 객체를 통해 page, size, sort 자동 처리
     * URL 예: GET /api/notices/search?keyword=휴무&searchType=title&page=0&size=10
     */
    @GetMapping("/search")
    public Page<ErpNotiDTO> searchNotices(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String searchType,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            Pageable pageable) {
        return notiService.searchNoticesWithPaging(keyword, searchType, category, status, pageable);
    }

    /**
     * 공지사항 등록
     * - FormData 형식으로 전송된 multipart/form-data 요청 처리
     * - 공지 데이터 + 파일 첨부 받기
     */
    @PostMapping("/create")
    public ResponseEntity<?> createNotice(
            @RequestParam("erpNotiTitle") String title,
            @RequestParam("erpNotiContent") String content,
            @RequestParam("empId") String empId,
            @RequestParam("erpNotiType") String type,
            @RequestParam("erpNotiExpiredAt") String expiredAt,
            @RequestParam(value = "erpNotiFile", required = false) MultipartFile file) {	// @RequestParam, MultipartFile으로 받음

    	// DTO에 데이터 수동 세팅
        ErpNotiDTO notice = new ErpNotiDTO();
        notice.setErpNotiTitle(title);
        notice.setErpNotiContent(content);
        notice.setEmpId(empId);
        notice.setErpNotiType(type);
        notice.setErpNotiExpiredAt(Date.valueOf(expiredAt));	// String → java.sql.Date

        return notiService.createNotice(notice, file);
    }

    // 공지사항 수정
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateNotice(
            @PathVariable Long id,
            @RequestParam("erpNotiTitle") String title,
            @RequestParam("erpNotiContent") String content,
            @RequestParam("empId") String empId,
            @RequestParam("erpNotiType") String type,
            @RequestParam("erpNotiExpiredAt") String expiredAt,
            @RequestParam(value = "erpNotiFile", required = false) MultipartFile file) {

        return notiService.updateNotice(id, title, content, empId, type, expiredAt, file);
    }

    // 공지사항 삭제
    @DeleteMapping("/delete/{id}")
    public void deleteNotice(@PathVariable Long id) {
        notiService.deleteComNoti(id);
    }

    /**
     * 파일 다운로드 (공지 ID 기준)
     * - 사용자가 첨부 파일을 다운로드할 수 있도록 byte[] 형태로 반환
     * byte[]: 이미지, PDF, Word 파일, ZIP등은 텍스트가 아닌 바이너리(2진수)데이터를 받는다.
     */
    @GetMapping("/download-by-id/{id}")
    public ResponseEntity<byte[]> downloadFileById(@PathVariable Long id) {
        return notiService.downloadFileById(id);
    }
    
    /**
     * 최근 공지사항 N개 조회
     * - 홈화면 등에서 최신 공지를 5개 정도 띄울 때 사용
     * - URL 예: GET /api/notices/latest?size=5
     */
    @GetMapping("/latest")
    public ResponseEntity<List<ErpNotiDTO>> getLatestNotices(@RequestParam(defaultValue = "5") int size) {
        List<ErpNotiDTO> latestNotices = notiService.getLatestNotices(size);
        return ResponseEntity.ok(latestNotices);
    }
}
