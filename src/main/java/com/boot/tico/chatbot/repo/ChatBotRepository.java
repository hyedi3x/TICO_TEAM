package com.boot.tico.chatbot.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.boot.tico.chatbot.dto.ChatBotDTO;

public interface ChatBotRepository extends JpaRepository<ChatBotDTO, Integer> {
	/*
	 * List<ChatBotDTO> findByUserIdOrderByDateTimeAsc(String userId); 와 같음 ==
	 * SELECT * FROM chat_log WHERE user_id = ? ORDER BY date_time ASC; : Spring
	 * Data JPA에서는 메서드 이름 기반으로 자동 쿼리를 생성
	 * 
	 * @Query("SELECT c FROM ChatBotDTO c WHERE c.user_uuid = ?1 ORDER BY c.date_time ASC")
	 * : ?1 : 첫 번째 매개변수 = user_uuid 대체
	 * 쿼리 사용시 DTO 선언 변수와 정확히 c.변수명이 일치해야함, 불일치 시 에러 발생 
	 */
    @Query("SELECT c FROM ChatBotDTO c WHERE c.user_uuid = ?1 ORDER BY c.date_time ASC")
    List<ChatBotDTO> findUserChats(String user_uuid);
}

