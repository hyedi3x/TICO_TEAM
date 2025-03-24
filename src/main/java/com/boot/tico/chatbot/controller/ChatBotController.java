package com.boot.tico.chatbot.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.boot.tico.chatbot.dto.ChatBotDTO;
import com.boot.tico.chatbot.service.ChatBotService;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000") // CORS 설정 추가
@RestController
@RequestMapping("/api")
public class ChatBotController {

    @Autowired
    private ChatBotService chatBotService;

    // 변환된 음성 데이터를 반환하는 코드 
    @PostMapping("/db_speech_data")
    public ResponseEntity<String> getLatestContent(@RequestParam("id") Integer id) { // 요청 파라미터로 id 받기
        try {
            String content = chatBotService.getContentById(id);
            if (content != null) {
                System.out.println("스프링 부트: 데이터 반환 성공 - " + content);  // 성공 메시지 추가
                return ResponseEntity.ok(content);
            } else {
                System.out.println("스프링 부트: 데이터 없음");  // 데이터 없음 메시지 추가
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("스프링 부트: 오류 발생 - " + e.getMessage());  // 오류 메시지 출력
            e.printStackTrace();  // 예외 발생 시 스택 트레이스 출력
            return ResponseEntity.status(500).body("서버 내부 오류 발생");
        }
    }

    // React에서 전송한 메시지를 처리하는 엔드포인트 추가
    @PostMapping("/messages")
    public ResponseEntity<ChatBotDTO> addMessage(@RequestBody ChatBotDTO message) {
        try {
            ChatBotDTO savedMessage = chatBotService.addMessage(message);
            return ResponseEntity.ok(savedMessage);
        } catch (Exception e) {
            System.err.println("스프링 부트: 메시지 저장 오류 - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    // 저장된 메시지 목록을 반환하는 엔드포인트 추가
    @GetMapping("/messages")
    public ResponseEntity<List<ChatBotDTO>> getMessages() {
        try {
            List<ChatBotDTO> messages = chatBotService.getMessages();
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            System.err.println("스프링 부트: 메시지 목록 조회 오류 - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }
}