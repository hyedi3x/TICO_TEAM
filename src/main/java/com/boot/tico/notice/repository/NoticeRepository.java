package com.boot.tico.notice.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.boot.tico.notice.dto.NoticeDTO;

public interface NoticeRepository extends JpaRepository<NoticeDTO, Integer>{
	
}
