package com.boot.tico.blocklyObject.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.boot.tico.blocklyObject.dto.BlocklyUploadFile;
import com.boot.tico.blocklyObject.service.BlocklyUploadFileService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/blockly-upload-file")
@RequiredArgsConstructor
public class BlocklyUploadFileController {

    private final BlocklyUploadFileService uploadFileService;

    // 파일 업로드
    @PostMapping
    public ResponseEntity<BlocklyUploadFile> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("user_uuid") String userUuid
    ) throws Exception {
        BlocklyUploadFile uploadedFile = uploadFileService.uploadFile(file, userUuid);
        return ResponseEntity.ok(uploadedFile);
    }

    // 업로드 파일 목록 조회
    @GetMapping("/{userUuid}")
    public ResponseEntity<List<BlocklyUploadFile>> getUploadedFiles(@PathVariable String userUuid) {
        return ResponseEntity.ok(uploadFileService.getUploadedFiles(userUuid));
    }

    // 파일 삭제
    @DeleteMapping("/{fileId}")
    public ResponseEntity<String> deleteFile(@PathVariable String fileId) {
        uploadFileService.deleteFile(fileId);
        return ResponseEntity.ok("파일 삭제 완료");
    }
}
