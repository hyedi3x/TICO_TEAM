package com.boot.tico.chat.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
  @Override
  public void configureMessageBroker(MessageBrokerRegistry config) {
    // 클라이언트로부터 /app/** 로 시작하는 메시지를 @MessageMapping 으로 라우팅
    config.setApplicationDestinationPrefixes("/app");
    // 서버 → 클라이언트로 보낼 때는 /topic/** 에 subscribe
    config.enableSimpleBroker("/topic");
  }

  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry
      .addEndpoint("/ws-chat")                   	  // WebSocket 엔드포인트
      .setAllowedOrigins("https://tico.kro.kr") // React 앱 주소
      .withSockJS();                             	  // SockJS fallback 지원
  }
}
