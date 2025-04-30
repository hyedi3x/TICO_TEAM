package com.boot.tico.notice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.boot.tico.notice.dto.NoticeDTO;

@Repository
public interface NoticeRepository extends JpaRepository<NoticeDTO, Integer>{
	
	@Query(value = "SELECT COALESCE(MAX(notice_id), 0) FROM notice_tb", nativeQuery = true)
    Integer findMaxNoticeId();
	
}
