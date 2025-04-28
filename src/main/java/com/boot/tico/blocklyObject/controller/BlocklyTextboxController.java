package com.boot.tico.blocklyObject.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.boot.tico.blocklyObject.dto.BlocklyTextbox;
import com.boot.tico.blocklyObject.service.BlocklyTextboxService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/blockly-textboxes")
@RequiredArgsConstructor
public class BlocklyTextboxController {

    private final BlocklyTextboxService textboxService;

    // 글상자 저장
    @PostMapping
    public ResponseEntity<BlocklyTextbox> saveTextbox(@RequestBody BlocklyTextbox textbox) {
        BlocklyTextbox saved = textboxService.saveTextbox(textbox);
        return ResponseEntity.ok(saved);
    }

    // 사용자별 글상자 목록 조회
    @GetMapping("/{userUuid}")
    public ResponseEntity<List<BlocklyTextbox>> getTextboxes(@PathVariable String userUuid) {
        return ResponseEntity.ok(textboxService.getTextboxesByUser(userUuid));
    }

    // 글상자 삭제
    @DeleteMapping("/{textboxId}")
    public ResponseEntity<String> deleteTextbox(@PathVariable String textboxId) {
        textboxService.deleteTextbox(textboxId);
        return ResponseEntity.ok("삭제 완료");
    }
}
