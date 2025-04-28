package com.boot.tico.blocklyObject.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.boot.tico.blocklyObject.dto.BlocklyTextbox;
import com.boot.tico.blocklyObject.repo.BlocklyTextboxRepo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BlocklyTextboxService {

    private final BlocklyTextboxRepo textboxRepo;

    // 글상자 저장
    public BlocklyTextbox saveTextbox(BlocklyTextbox textbox) {
    	// 🔥 새 글상자 저장할 때 textboxId를 만들어줌
        if (textbox.getTextboxId() == null || textbox.getTextboxId().isBlank()) {
            String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
            textbox.setTextboxId("textbox_" + uuid);
        }
        return textboxRepo.save(textbox);
    }

    // 사용자별 글상자 목록 조회
    public List<BlocklyTextbox> getTextboxesByUser(String userUuid) {
        return textboxRepo.findByUserUuid(userUuid);
    }

    // 글상자 단일 삭제
    public void deleteTextbox(String textboxId) {
        textboxRepo.deleteById(textboxId);
    }
}
