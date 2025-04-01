package com.boot.tico.erp.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.boot.tico.erp.dto.JobDTO;

public interface JobRepository extends JpaRepository<JobDTO, String> {
	// 직무명에 keyword가 포함된 목록을 대소문자 구분 없이 검색
	List<JobDTO> findByJobNameContainingIgnoreCase(String keyword);
}
