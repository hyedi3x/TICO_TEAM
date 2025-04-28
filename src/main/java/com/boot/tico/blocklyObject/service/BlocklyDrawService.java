package com.boot.tico.blocklyObject.service;

import java.io.File;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.boot.tico.blocklyObject.dto.BlocklyDraw;
import com.boot.tico.blocklyObject.repo.BlocklyDrawRepo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BlocklyDrawService {

    private final BlocklyDrawRepo repo;

    // 파일 기본 저장 경로 (서버 업로드 폴더에 맞게 수정)
    private static final String FILE_BASE_PATH = System.getProperty("user.dir") + "/uploads/images/blocklyDraws/";

    // 저장
    public BlocklyDraw save(BlocklyDraw draw) {
        return repo.save(draw);
    }

    // 전체 조회
    public List<BlocklyDraw> findAll() {
        return repo.findAll();
    }

    // 사용자 별 조회
    public List<BlocklyDraw> findByUserUuid(String userUuid) {
        return repo.findByUserUuid(userUuid);
    }

    // 삭제 (DB + 서버 파일 둘 다 삭제)
    @Transactional
    public void deleteByDrawId(String drawId) {
        // 1. 삭제할 그림 조회
        BlocklyDraw drawing = repo.findById(drawId)
            .orElseThrow(() -> new RuntimeException("삭제할 그림을 찾을 수 없습니다."));

        // 2. 파일 삭제
        deleteFileIfExists(drawing.getImageUrl());

        // 3. DB 삭제
        repo.deleteById(drawId);
    }

    // 파일 삭제 메서드
    private void deleteFileIfExists(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) return;

        try {
            String fileName = new File(relativePath).getName();
            File file = new File(FILE_BASE_PATH + fileName);

            if (file.exists()) {
                boolean deleted = file.delete();
                System.out.println(deleted ? "🗑️ 파일 삭제 완료: " + file.getAbsolutePath() : "⚠️ 파일 삭제 실패: " + file.getAbsolutePath());
            }
        } catch (Exception e) {
            System.out.println("⚠️ 파일 삭제 중 오류: " + e.getMessage());
        }
    }
}
