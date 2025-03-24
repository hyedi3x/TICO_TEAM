package com.boot.tico.chatbot.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import com.boot.tico.chatbot.dto.ChatBotDTO;

public interface ChatBotRepository extends JpaRepository<ChatBotDTO, Integer> {
}
