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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.boot.tico.erp.dto.ErpNotiDTO;
import com.boot.tico.erp.repo.ErpNotiRepository;

@Service
public class ErpNotiService {

    @Autowired
    private ErpNotiRepository notiRepo;

    @Value("${file.upload-dir}")	// 파일이 저장될 경로. application.yml에서 주입받음.
    private String UPLOAD_DIR;

    // 공지사항 목록 검색 + 필터링 + 페이징 처리
    // Page<T> 타입으로 리턴. 페이지 처리된 결과를 포함한 객체. (현재 페이지 데이터 목록 getContent(), 전체 페이지 수 getTotalPages(), 전체 데이터 개수 getTotalElements(), 현재 페이지 번호 getNumber()) 
    public Page<ErpNotiDTO> searchNoticesWithPaging(String keyword, String searchType, String category, String status, Pageable pageable) {
        return notiRepo.findByKeywordPaging(keyword, searchType, category, status, pageable);
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

            // 만료일이 지난 날자면 비활성화 처리
            if (notice.getErpNotiExpiredAt() != null && notice.getErpNotiExpiredAt().before(Date.valueOf(LocalDate.now()))) {
                notice.setErpNotiStatus("inactive");
            } else {
                notice.setErpNotiStatus("active");
            }

            notiRepo.save(notice);
            return ResponseEntity.ok("공지사항 등록 성공");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("등록 오류: " + e.getMessage());	// 등록 중 오류가 발생하면 500 에러와 함께 에러 메시지를 반환
        }
    }

    // 공지 수정
    public ResponseEntity<?> updateNotice(Long id, String title, String content, String empId, String type, String expiredAt, MultipartFile file) {
        try {
        	// 수정 대상 공지사항 조회
            Optional<ErpNotiDTO> optional = notiRepo.findById(id);	// Optional<T> 클래스 : NPE를 방지할 수 있도록 도와줌. null이 올 수 있는 값을 감싸는 Wrapper 클래스. NPE(NullPointerException):null객체를 참조하려고 할 때 발생하는 런타임예외.
            if (!optional.isPresent()) {	// optional안에 실제 공지사항 데이터가 존재하지 않을 경우 체크. 값이 없는 경우 true
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("해당 공지사항 없음");
            }

            // 필드 값 수정
            ErpNotiDTO notice = optional.get();		// .get() 객체에서 실제 값을 꺼냄. 값이 없을 경우 예외(NoSuchElementException)
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

            // 상태 값 업데이트(active/inactive)
            if (notice.getErpNotiExpiredAt() != null && notice.getErpNotiExpiredAt().before(Date.valueOf(LocalDate.now()))) {
                notice.setErpNotiStatus("inactive");
            } else {
                notice.setErpNotiStatus("active");
            }

            // 저장 및 응답 반환
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
        if (notice != null && notice.getErpNotiFile() != null) {	// 공지사항 존재하고, 첨부파일도 존재하는 경우
            Path filePath = Paths.get(UPLOAD_DIR, notice.getErpNotiFile());		// 저장된 첨부파일의 경로를 생성
            try {
                Files.deleteIfExists(filePath);		// 파일이 존재할 경우 삭제
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        notiRepo.deleteById(id);	// DB에서 공지사항 레코드도 삭제
    }

    // 공지사항 첨부파일 다운로드 처리
    public ResponseEntity<byte[]> downloadFileById(Long id) {
    	//공지사항 존재 여부 확인
        Optional<ErpNotiDTO> optional = notiRepo.findById(id);
        if (!optional.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        // 파일 이름 정보 확인
        ErpNotiDTO notice = optional.get();
        String savedName = notice.getErpNotiFile();
        String originalName = notice.getErpNotiOriginalFile();

        if (savedName == null || originalName == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);	// 필수 정보가 없다면 400
        }
        
        // 파일 존재 여부 확인
        Path filePath = Paths.get(UPLOAD_DIR, savedName);
        if (!Files.exists(filePath)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        // 파일 읽고 응답 생성
        try {
            byte[] fileBytes = Files.readAllBytes(filePath);		// 파일을 바이트 배열로 읽음
            String encodedName = URLEncoder.encode(originalName, "UTF-8").replaceAll("\\+", "%20");	// 한글/특수문자 인코딩. 공백이 기본적으로 + 로 변환됨. Content-Disposition 헤더에서 + 가 공백으로 인식되지 않을 수 있어, 정확한 공백표현인 %20로 바꿈.
            String contentType = Files.probeContentType(filePath);	// MIME 타입 추측
            if (contentType == null) contentType = "application/octet-stream";	// 기본값(바이너리 파일입니다 라는 뜻)

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))		// 응답의 Content-Type 헤더 설정
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + encodedName + "\"")	// 다운로드용 파일명 설정, 브라우저가 강제로 다운로드하도록 유도하는 헤더.
                    .body(fileBytes);	// 실제 파일의 바이트 데이터를 응답의 본문으로 전송

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // 파일 저장 처리 (랜덤 파일명으로 저장)
    private Map<String, String> storeFile(MultipartFile file) throws IOException {
        String originalFileName = file.getOriginalFilename();	// 업로드된 원본 파일명 추출
        String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));	// 파일 확장자 추출 .pdf
        String fileName = UUID.randomUUID().toString() + fileExtension;		// UUID로 저장할 파일 이름 생성

        // 디렉토리 경로 확인 및 생성
        File dir = new File(UPLOAD_DIR);
        if (!dir.exists()) dir.mkdirs();

        // 파일 저장(복사) transferTo(): 임시 저장된 업로드 파일을 지정한 위치로 이동
        file.transferTo(new File(UPLOAD_DIR + File.separator + fileName));

        // 저장 결과를 Map에 담아 반환
        Map<String, String> result = new HashMap<>();
        result.put("savedName", fileName);				// 서버에 저장된 이름
        result.put("originalName", originalFileName);	// 사용자 업로드 당시 이름
        return result;
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