package com.boot.tico.chatbot.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.boot.tico.chatbot.dto.ChatBotDTO;
import com.boot.tico.chatbot.repo.ChatBotRepository;

import java.util.List;
import java.util.Optional;

@Service
public class ChatBotService {

    @Autowired
    private ChatBotRepository chatBotRepository;

    // 음성 변환 콘텐트를 반환하는 메서드
    public String getContentById(Integer id) {
        try {
            Optional<ChatBotDTO> chatLog = chatBotRepository.findById(id);
            if (chatLog.isPresent()) {
                return chatLog.get().getContent();
            } else {
                return null;
            }
        } catch (Exception e) {
            System.err.println("스프링 부트 서비스: 데이터베이스 오류 - " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    // 텍스트 입력 메시지를 저장하는 메서드
    public ChatBotDTO addMessage(ChatBotDTO message) {
        try {
            return chatBotRepository.save(message); // record 필드 설정 제거
        } catch (Exception e) {
            System.err.println("스프링 부트 서비스: 메시지 저장 오류 - " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    // 텍스트 입력 메시지의 목록을 조회하는 메서드 추가
    public List<ChatBotDTO> getMessages() {
        try {
            return chatBotRepository.findAll();
        } catch (Exception e) {
            System.err.println("스프링 부트 서비스: 메시지 목록 조회 오류 - " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
}