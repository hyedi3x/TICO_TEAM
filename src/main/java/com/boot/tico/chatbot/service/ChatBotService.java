package com.boot.tico.chatbot.service;

import com.boot.tico.chatbot.dto.ChatBotDTO;
import com.boot.tico.chatbot.repo.ChatBotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatBotService {

    @Autowired
    private ChatBotRepository chatRepo;

    // 음성/일반 구분 없이 메시지 저장 
    // (record: 'Y' => 음성, 'N' => 일반, 'B' => 챗봇 응답)
    public ChatBotDTO addMessage(ChatBotDTO chatBotDTO) {
        // record가 null 또는 trim(공백 제거) / 빈 문자열이면 기본값 "N" 설정
        if (chatBotDTO.getRecord() == null || chatBotDTO.getRecord().trim().isEmpty()) {
            chatBotDTO.setRecord("N");
        }

        if (chatBotDTO.getSender() == null || chatBotDTO.getSender().trim().isEmpty()) {
            chatBotDTO.setSender("user");
        }

        if (chatBotDTO.getUser_uuid() == null || chatBotDTO.getUser_uuid().trim().isEmpty()) {
            // IllegalArgumentException : "잘못된 인자(Argument)가 전달되었을 때 발생하는 예외"
        	throw new IllegalArgumentException("userId는 필수입니다.");
        }

        return chatRepo.save(chatBotDTO);
    }

    // 모든 메시지 목록 조회
    public List<ChatBotDTO> getMessages() {
        return chatRepo.findAll();
    }
    
    // 특정 사용자의 메시지 목록 반환 (정렬: 오래된 순)
    public List<ChatBotDTO> getMsgByUser(String userUUID) {
        return chatRepo.findUserChats(userUUID);
    }
}
