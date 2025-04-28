package com.boot.tico.blocklyObject.service;

import java.io.File;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.boot.tico.blocklyObject.dto.BlocklyUploadFile;
import com.boot.tico.blocklyObject.repo.BlocklyUploadFileRepo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BlocklyUploadFileService {

    private final BlocklyUploadFileRepo fileRepo;

    // 저장 경로: 기존 오브젝트와 동일
    private static final String FILE_BASE_PATH = System.getProperty("user.dir") + "/uploads/images/blocklyUploadFile/";

    // 허용 확장자 목록
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "bmp", "webp");

    // 최대 파일 사이즈 (10MB)
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    // 파일 업로드 처리
    public BlocklyUploadFile uploadFile(MultipartFile file, String userUuid) throws Exception {
        // 1. 저장 디렉토리 만들기
    	ensureDirectoryExists();

        // 2. 파일 이름 및 유효성 검사
        // 3. 파일 크기 검사
        // 4. 확장자 검사
        String originalFilename = validateAndGetOriginalFilename(file);
        validateFileSize(file);
        validateFileExtension(originalFilename);
        
        // 5. UUID 생성
        String uuid = UUID.randomUUID().toString();
        
        // 6. 파일 저장 이름 (UUID + 확장자)
        // fileId는 file_ + UUID
        String extension = getFileExtension(originalFilename);
        String storedFilename = uuid + "." + extension;
        String fileId = "file_" + uuid;

        File dest = new File(FILE_BASE_PATH, storedFilename);
        file.transferTo(dest);


        // 7. DB에 저장
        BlocklyUploadFile uploadFile = BlocklyUploadFile.builder()
                .fileId(fileId)
                .originalFilename(originalFilename)
                .storedFilename(storedFilename)
                .filePath("/uploads/images/blocklyUploadFile/" + storedFilename)
                .fileSize(file.getSize())
                .fileType(file.getContentType())
                .userUuid(userUuid)
                .build();

        return fileRepo.save(uploadFile);
    }
    
    // 업로드 디렉토리가 없다면 생성
    private void ensureDirectoryExists() {
        File dir = new File(FILE_BASE_PATH);
        if (!dir.exists()) dir.mkdirs();
    }
    
    // 파일 이름 유효성 검사 및 반환
    private String validateAndGetOriginalFilename(MultipartFile file) throws Exception {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new Exception("파일 이름이 유효하지 않습니다.");
        }
        return originalFilename;
    }
    
    // 파일 크기 검사
    private void validateFileSize(MultipartFile file) throws Exception {
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new Exception("파일 크기가 10MB를 초과합니다.");
        }
    }
    
    // 파일 확장자 검사
    private void validateFileExtension(String filename) throws Exception {
        String extension = getFileExtension(filename);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new Exception("허용되지 않은 파일 형식입니다. (허용: jpg, jpeg, png, bmp, webp)");
        }
    }

    // 파일 확장자 추출 메서드
    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex == -1) return "";
        return filename.substring(dotIndex + 1);
    }

    // 사용자별 업로드 파일 조회
    public List<BlocklyUploadFile> getUploadedFiles(String userUuid) {
        return fileRepo.findByUserUuid(userUuid);
    }

    // 파일 삭제
    public void deleteFile(String fileId) {
        fileRepo.findById(fileId).ifPresent(file -> {
            deleteFileIfExists(file.getStoredFilename());
            fileRepo.delete(file);
        });
    }

    // 실제 파일 삭제
    private void deleteFileIfExists(String storedFilename) {
        if (storedFilename == null || storedFilename.isBlank()) return;

        File file = new File(FILE_BASE_PATH, storedFilename);
        if (file.exists()) {
            boolean deleted = file.delete();
            System.out.println(deleted ? "🗑️ 파일 삭제 완료: " + file.getName() : "⚠️ 파일 삭제 실패: " + file.getName());
        }
    }

}