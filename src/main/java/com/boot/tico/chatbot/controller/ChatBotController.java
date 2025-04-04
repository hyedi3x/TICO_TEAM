package com.boot.tico.chatbot.controller;

import com.boot.tico.chatbot.dto.ChatBotDTO;
import com.boot.tico.chatbot.service.ChatBotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ChatBotController {

    @Autowired
    private ChatBotService chatService;

    // 메시지 저장 (사용자 텍스트 or 음성)
	/*
	 * ResponseEntity: 스프링 웹(Spring Web)에서 HTTP 응답을 표현하는 클래스 
	 * = HTTP 상태 코드, 헤더, 바디(body) 등을 직접 제어
	 * 
	 * @RequestBody : 클라이언트(예: React, Postman 등)에서 보낸 JSON 데이터를 자바 객체로 변환
	 */    
    @PostMapping("/messages")
    public ResponseEntity<ChatBotDTO> addMessage(@RequestBody ChatBotDTO chatBotDTO) {
        try {
            // record가 null이면 기본값 "N" (텍스트 입력) 설정
            if (chatBotDTO.getRecord() == null) {
                chatBotDTO.setRecord("N");  // 기본값: 텍스트 입력
            }
            // sender가 명시되지 않았다면 서비스에서 기본값 ("user" 또는 record가 "B"인 경우 "bot") 설정됨
            ChatBotDTO saved = chatService.addMessage(chatBotDTO);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            System.err.println("메시지 저장 오류 - " + e.getMessage());
            e.printStackTrace();
            // 500 에러 발생 및 반환할 객체 없음 (ResponseEntity<ChatBotDTO>)
            return ResponseEntity.status(500).body(null);
        }
    }
    
    // 챗봇 응답 저장 API
    @PostMapping("/bot/reply")
    public ResponseEntity<ChatBotDTO> addBotReply(@RequestBody ChatBotDTO chatBotDTO) {
        try {
            chatBotDTO.setRecord("B"); // 'B'는 Bot의 응답 메시지
            chatBotDTO.setSender("bot"); // 명시적으로 sender를 "bot"으로 설정
            System.out.println("봇 응답 저장: " + chatBotDTO.getMsg());
            ChatBotDTO saved = chatService.addMessage(chatBotDTO);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
        	e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }
    
    // 저장된 메시지 전부 조회
    @GetMapping("/messages")
    public ResponseEntity<List<ChatBotDTO>> getMessages() {
        try {
            List<ChatBotDTO> messages = chatService.getMessages();  // 메시지 목록 조회
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            System.err.println("메시지 목록 조회 오류 - " + e.getMessage());
            e.printStackTrace();
            // 500 에러 발생 및 반환할 객체 없음 (ResponseEntity<List<ChatBotDTO>>)
            return ResponseEntity.status(500).body(null);
        }
    }

    // 사용자별 메시지 조회 (user_uuid로 조회)
	/*
	 * @PathVariable : 주소 중 일부를 변수처럼 받아서 쓰고 싶을 때, URL의 {user_uuid} 부분과 매핑
	 */    		
    @GetMapping("/messages/user/{user_uuid}")
    public ResponseEntity<List<ChatBotDTO>> getMsgByUser(@PathVariable String user_uuid) {
        try {
            return ResponseEntity.ok(chatService.getMsgByUser(user_uuid));
        } catch (Exception e) {
            System.err.println("사용자 메시지 조회 오류 - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }
}