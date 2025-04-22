package com.boot.tico.blocklyObject.service;

import java.io.File;
import java.io.IOException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.boot.tico.blocklyObject.dto.BlocklyObject;
import com.boot.tico.blocklyObject.repo.BlocklyObjectRepo;

@Service
public class BlocklyObjectService {

    @Autowired
    private BlocklyObjectRepo blocklyObRepo;

    // 파일 기본 저장 경로 (상대경로로 사용)
    private static final String FILE_BASE_PATH = System.getProperty("user.dir") + "/uploads/images/blocklyObjects/";
    
    // 오브젝트 전체 조회
    public List<BlocklyObject> getAllObjects() {
        return blocklyObRepo.findAll();
    }

    // 카테고리별 오브젝트 조회
    public List<BlocklyObject> getObjectsByCategory(String category) {
        return blocklyObRepo.findByBlocklyObjectCategory(category);
    }

    // 단일 오브젝트 조회
    public BlocklyObject getById(Long id) {
        return blocklyObRepo.findById(id).orElse(null);
    }
    
    // 오브젝트 업로드 및 저장
    public void saveUploadedObject(MultipartFile file, String userUuid, String category, String name, String description) throws IOException {
        // 1. 저장 디렉토리 설정(없으면 생성)
        File dir = new File(FILE_BASE_PATH);
        if (!dir.exists()) dir.mkdirs();

        // 2. 원본 파일명 유효성 검사
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new IOException("파일 이름이 유효하지 않습니다.");
        }

        // 3. 파일 중복 검사
        File destFile = new File(FILE_BASE_PATH, originalFilename);
        if (destFile.exists()) {
            throw new IOException(" 같은 이름의 파일이 이미 존재합니다: " + originalFilename);
        }

        // 4. 파일 저장
        file.transferTo(destFile);
        System.out.println(" 파일 저장 완료: " + destFile.getAbsolutePath());

        // 5. DB에 오브젝트 정보 저장 (상대경로 저장)
        BlocklyObject obj = BlocklyObject.builder()
                .blocklyObjectName(name)
                .blocklyObjectCategory(category)
                .blocklyObjectFilePath("/uploads/images/blocklyObjects/" + originalFilename)
                .blocklyObjectDescription(description)
                .empId(userUuid)
                .blocklyObjectPoint(false)	// 기본은 무료 오브젝트
                .blocklyObjectCreatedAt(Timestamp.valueOf(LocalDateTime.now()))
                .build();

        blocklyObRepo.save(obj);
        System.out.println(" DB 저장 완료: " + obj.getBlocklyObjectName());
    }
    
    // 오브젝트 수정(파일 교체도 포함)
    public void updateObject(Long id, String name, String category, String description, MultipartFile file, String userUuid) throws IOException {
        Optional<BlocklyObject> optional = blocklyObRepo.findById(id);
        if (optional.isEmpty()) throw new IOException("오브젝트를 찾을 수 없습니다.");

        BlocklyObject obj = optional.get();

        // 기본 정보 업데이트
        obj.setBlocklyObjectName(name);
        obj.setBlocklyObjectCategory(category);
        obj.setBlocklyObjectDescription(description);

        // 파일이 존재할 경우 기존 파일 삭제 및 새 파일 저장
        if (file != null && !file.isEmpty()) {
            // 기존 파일 삭제
            String oldPath = System.getProperty("user.dir") + obj.getBlocklyObjectFilePath();
            File oldFile = new File(oldPath);
            if (oldFile.exists()) oldFile.delete();

            // 새 파일 저장
            String originalFilename = file.getOriginalFilename();
            File newFile = new File(FILE_BASE_PATH, originalFilename);
            file.transferTo(newFile);

            // 경로 업데이트
            obj.setBlocklyObjectFilePath("/uploads/images/blocklyObjects/" + originalFilename);
        }
        blocklyObRepo.save(obj);
    }

    // 오브젝트 단일 삭제
    public void deleteObject(Long id) {
    	Optional<BlocklyObject> optional = blocklyObRepo.findById(id);
        if (optional.isPresent()) {
            BlocklyObject obj = optional.get();
            // 이미지 파일 삭제
            deleteFileIfExists(obj.getBlocklyObjectFilePath());
            // DB에서 오브젝트 삭제
            blocklyObRepo.deleteById(id);
        }
    }
    
    // 오브젝트 다중 삭제
    public void deleteMultipleObjects(List<Long> ids) {
    	  // 삭제 대상 오브젝트들 조회
    	  List<BlocklyObject> objects = blocklyObRepo.findAllById(ids);
    	  // 각각의 이미지 파일 삭제
          for (BlocklyObject obj : objects) {
              deleteFileIfExists(obj.getBlocklyObjectFilePath());
          }
        // 일괄 DB 삭제 (JPA 배치)
        blocklyObRepo.deleteAllByIdInBatch(ids);	// JPA에서 제공하는 배치 삭제. 일괄 삭제 메서드
       }
    
    // 파일 삭제 메서드
    private void deleteFileIfExists(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) return;

        // 상대 경로 → 실제 경로 변환 후 삭제
        File file = new File(FILE_BASE_PATH + new File(relativePath).getName());
        if (file.exists()) {
            boolean deleted = file.delete();
            System.out.println(deleted ? "🗑파일 삭제 완료: " + file.getName() : "⚠️ 파일 삭제 실패: " + file.getName());
        }
    }
}
