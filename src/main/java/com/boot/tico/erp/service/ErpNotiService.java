package com.boot.tico.erp.service;

import java.io.File;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.file.*;
import java.sql.Date;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.boot.tico.erp.dto.EmpDTO;
import com.boot.tico.erp.dto.ErpNotiDTO;
import com.boot.tico.erp.dto.Notification;
import com.boot.tico.erp.repo.EmpRepository;
import com.boot.tico.erp.repo.ErpNotiRepository;
import com.boot.tico.erp.repo.NotificationRepo;

@Service
public class ErpNotiService {

    @Autowired
    private ErpNotiRepository notiRepo;
    
    @Autowired
    private NotificationRepo notificationRepo;
    
    @Autowired 
    private EmpRepository empRepo;

    // 파일 기본 저장 경로 (상대경로로 사용)
    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/files/";

    // 관리자 회원 정보 단건 조회
    public EmpDTO getEmployeeById(String empId) {
        return empRepo.findFirstByEmpId(empId).orElse(null);
    }
    
    // 공지사항 목록 검색 + 필터링 + 페이징 처리
    // Page<T> 타입으로 리턴. 페이지 처리된 결과를 포함한 객체. (현재 페이지 데이터 목록 getContent(), 전체 페이지 수 getTotalPages(), 전체 데이터 개수 getTotalElements(), 현재 페이지 번호 getNumber()) 
    public Page<ErpNotiDTO> searchNoticesWithPaging(String keyword, String searchType, String category, String status, String empId, Pageable pageable) {
        return notiRepo.findByKeywordPaging(keyword, searchType, category, status, empId, pageable);
    }

    // 단건 조회
    public ErpNotiDTO getComNotiById(Long id) {
        return notiRepo.findById(id).orElse(null);
    }

    // 공지 등록(파일 포함)
    public ResponseEntity<?> createNotice(ErpNotiDTO notice, MultipartFile file) {
        try {
        	// 파일 있으면 저장
            if (file != null && !file.isEmpty()) {
                Map<String, String> fileInfo = storeFile(file);		// 첨부 파일이 있다면, storeFile(file)메서드를 호출해서 서버에 저장. storeFile()메서드는 저장된 실제 파일명(UUID.확장자)과 원본 파일명을 Map으로 반환.
                notice.setErpNotiFile(fileInfo.get("savedName"));
                notice.setErpNotiOriginalFile(fileInfo.get("originalName"));
            }

            // 작성일 설정
            notice.setErpNotiCreatedAt(Timestamp.valueOf(LocalDateTime.now()));
            updateNoticeStatus(notice);
            
            notice.setErpNotiCreatedAt(Timestamp.valueOf(LocalDateTime.now()));
            updateNoticeStatus(notice);

            // 공지사항 저장
            notiRepo.save(notice);
            
            // 내일 날짜 계산. 알림 자동 생성 로직 추가 (내일 마감 공지. 모든 직원이 조회할 수 있게)
            LocalDate tomorrow = LocalDate.now().plusDays(1);
            
        	// 내일 마감인 공지일 때만 알림 생성
            if (notice.getErpNotiExpiredAt() != null &&
                notice.getErpNotiExpiredAt().toLocalDate().isEqual(tomorrow)) {
            	
            	// 실수 방지 코드
                String empId = "ALL";
                if (!"ALL".equals(empId) && !empRepo.existsByEmpId(empId)) {
                    throw new IllegalArgumentException("알림 대상자가 존재하지 않습니다: " + empId);
                }
                
            	// 중복 알림 방지: 이미 생성된 알림이 있는지 확인
                boolean exists = notificationRepo.existsByRelatedTypeAndRelatedIdAndEmpId("notice", notice.getErpNotiId(), "ALL");
                
                if (!exists) {
                Notification notification = new Notification();
                notification.setEmpId("ALL");  // 관리자 전체에게 보이는 알림
                notification.setNotificationTitle("[공지] 만료 예정: " + notice.getErpNotiTitle());
                notification.setNotificationMessage("등록된 공지사항이 내일 만료됩니다.");
                notification.setRelatedType("notice");
                notification.setRelatedId(notice.getErpNotiId());
                notification.setLinkUrl("/noticeDetail/" + notice.getErpNotiId());

                notificationRepo.save(notification);
            }
           }
            return ResponseEntity.ok("공지사항 등록 성공");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("등록 오류: " + e.getMessage());
        }
    }

    // 공지 수정
    public ResponseEntity<?> updateNotice(Long id, String title, String content, String empId, String type, String expiredAt, MultipartFile file) {
        try {
        	ErpNotiDTO notice = notiRepo.findById(id).orElse(null);
            if (notice == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("해당 공지사항 없음");

            // 필드 값 수정
            notice.setErpNotiTitle(title);
            notice.setErpNotiContent(content);
            notice.setEmpId(empId);
            notice.setErpNotiType(type);

            // 만료일 처리(expiredAt이 비어 있지 않은 경우에만 Date로 변환해서 저장)
            if (expiredAt != null && !expiredAt.trim().isEmpty()) {		
                notice.setErpNotiExpiredAt(Date.valueOf(expiredAt));
            }

            // 파일이 있는 경우 파일도 교체
            if (file != null && !file.isEmpty()) {
                Map<String, String> fileInfo = storeFile(file);
                notice.setErpNotiFile(fileInfo.get("savedName"));
                notice.setErpNotiOriginalFile(fileInfo.get("originalName"));
            }

            // 수정일 설정
            notice.setErpNotiUpdatedAt(Timestamp.valueOf(LocalDateTime.now()));
            updateNoticeStatus(notice);
            
            notiRepo.save(notice);
            return ResponseEntity.ok("공지사항 수정 성공");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("수정 오류: " + e.getMessage());
        }
    }

    
    // 공지 삭제(파일도 함께 삭제)
    public void deleteComNoti(Long id) {
    	 ErpNotiDTO notice = notiRepo.findById(id).orElse(null);
         if (notice != null) {
             deleteFileIfExists(notice.getErpNotiFile());
             notiRepo.deleteById(id);
         }
     }


     // 첨부파일 다운로드
        public ResponseEntity<byte[]> downloadFileById(Long id) {
            ErpNotiDTO notice = notiRepo.findById(id).orElse(null);
            if (notice == null || notice.getErpNotiFile() == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }

            Path filePath = Paths.get(UPLOAD_DIR, notice.getErpNotiFile());
            if (!Files.exists(filePath)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }

            try {
                byte[] fileBytes = Files.readAllBytes(filePath);
                String encodedName = URLEncoder.encode(notice.getErpNotiOriginalFile(), "UTF-8").replaceAll("\\+", "%20");
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) contentType = "application/octet-stream";

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + encodedName + "\"")
                        .body(fileBytes);
            } catch (IOException e) {
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
            }
        }

    // 파일 저장 처리 (랜덤 파일명으로 저장)
    private Map<String, String> storeFile(MultipartFile file) throws IOException {
        String originalName = file.getOriginalFilename();	// 업로드된 원본 파일명 추출
        String extension  = originalName.substring(originalName.lastIndexOf("."));	// 파일 확장자 추출 .pdf
        String savedName  = UUID.randomUUID().toString() + extension;		// UUID로 저장할 파일 이름 생성

        // 디렉토리 경로 확인 및 생성
        File dir = new File(UPLOAD_DIR);
        if (!dir.exists()) dir.mkdirs();

        // 파일 저장(복사) transferTo(): 임시 저장된 업로드 파일을 지정한 위치로 이동
        File dest = new File(UPLOAD_DIR + File.separator + savedName);
        file.transferTo(dest);

        // 저장 결과를 Map에 담아 반환
        Map<String, String> result = new HashMap<>();
        result.put("savedName", savedName);				// 서버에 저장된 이름
        result.put("originalName", originalName);	// 사용자 업로드 당시 이름
        return result;
    }

    // 파일 삭제
    private void deleteFileIfExists(String fileName) {
        if (fileName == null) return;
        Path path = Paths.get(UPLOAD_DIR, fileName);
        try {
            Files.deleteIfExists(path);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    
    // 공지 상태(active/inactive) 업데이트
    private void updateNoticeStatus(ErpNotiDTO notice) {
        Date expired = notice.getErpNotiExpiredAt();
        if (expired != null && expired.before(Date.valueOf(LocalDate.now()))) {
            notice.setErpNotiStatus("inactive");
        } else {
            notice.setErpNotiStatus("active");
        }
    }
    
    // 매일 자정 만료 공지 비활성화
    @Scheduled(cron = "0 0 0 * * *")	// cron 표현식 언제 실행할지 지정(초, 분, 시, 매일매달매년)
    public void deactivateExpiredNotices() {
        LocalDate today = LocalDate.now();	// 현재 날짜만 추출(시간 제외)
        List<ErpNotiDTO> expired = notiRepo.findByErpNotiExpiredAtBeforeAndErpNotiStatus(today, "active");	// 만룍됐지만 아직 비활성화되지 않은 공지들
        for (ErpNotiDTO notice : expired) {
            notice.setErpNotiStatus("inactive");	
        }
        notiRepo.saveAll(expired);
        System.out.println("만료된 공지사항 자동 비활성화 완료: " + expired.size() + "건");
    }
    
    // 최신 공지사항 N개 조회
    public List<ErpNotiDTO> getLatestNotices(int size) {
        Pageable pageable = Pageable.ofSize(size);
        return notiRepo.findAllByOrderByErpNotiCreatedAtDesc(pageable);
    }

}