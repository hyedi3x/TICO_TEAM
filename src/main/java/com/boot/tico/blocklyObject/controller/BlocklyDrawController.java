package com.boot.tico.blocklyObject.controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.boot.tico.blocklyObject.dto.BlocklyDraw;
import com.boot.tico.blocklyObject.service.BlocklyDrawService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/blockly-draw")
@RequiredArgsConstructor
public class BlocklyDrawController {

    private final BlocklyDrawService service;

    private static final String FILE_BASE_PATH = System.getProperty("user.dir") + "/uploads/images/blocklyDraws/";

    // ✏️ 저장 (POST)
    @PostMapping("/save")
    public ResponseEntity<BlocklyDraw> save(@RequestBody BlocklyDraw draw) {
        try {
            // 1. drawId 생성
            String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
            String drawId = "draw_" + uuid;

            // 2. 파일 저장 (drawId를 파일명으로 사용)
            String savedFilePath = saveBase64Image(draw.getImageUrl(), drawId);

            // 3. Draw 객체에 세팅
            draw.setDrawId(drawId);
            draw.setImageUrl(savedFilePath);

            // 4. DB 저장
            BlocklyDraw saved = service.save(draw);
            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    // Base64 이미지를 파일로 저장
    private String saveBase64Image(String base64Data, String drawId) throws IOException {
        // 폴더 없으면 생성
        File dir = new File(FILE_BASE_PATH);
        if (!dir.exists()) dir.mkdirs();

        String fileName = drawId + ".png"; // 🔥 파일명은 drawId

        // Base64 데이터 디코딩
        String base64Image = base64Data.split(",")[1];
        byte[] decodedBytes = Base64.getDecoder().decode(base64Image);

        // 파일로 저장
        Path path = Paths.get(FILE_BASE_PATH, fileName);
        Files.write(path, decodedBytes);

        // DB에 저장될 상대경로 리턴. 저장
        return "/uploads/images/blocklyDraws/" + fileName;
    }

    // 전체 조회 (관리자용)
    @GetMapping("/all")
    public ResponseEntity<List<BlocklyDraw>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    // 👤 특정 사용자 그림 목록 조회
    @GetMapping("/user/{userUuid}")
    public ResponseEntity<List<BlocklyDraw>> findByUserUuid(@PathVariable String userUuid) {
        return ResponseEntity.ok(service.findByUserUuid(userUuid));
    }

    // 🗑️ 삭제
    @DeleteMapping("/delete/{drawId}")
    public ResponseEntity<Void> delete(@PathVariable String drawId) {
        service.deleteByDrawId(drawId);
        return ResponseEntity.ok().build();
    }
}
