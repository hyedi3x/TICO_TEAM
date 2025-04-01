package com.boot.tico.erp.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.boot.tico.erp.dto.DepDTO;

public interface DepRepository extends JpaRepository<DepDTO, String>  {
	// 부서명에 keyword가 포함된 목록을 대소문자 구분 없이 검색
    List<DepDTO> findByDepNameContainingIgnoreCase(String keyword);
}
