package com.boot.tico.chat.controller;

import com.boot.tico.chat.model.ChatMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

  // 클라이언트가 "/app/chat.send" 로 보낸 메시지를 받아서
  // /topic/public 구독자들에게 다시 브로드캐스트
  @MessageMapping("/chat.send")
  @SendTo("/topic/public")
  public ChatMessage send(ChatMessage message) {
    return message;
  }
}
