package com.boot.tico.erp.repo;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.boot.tico.erp.dto.ErpScheduleDTO;

/**
 * 🗂️ 일정 관련 DB 접근을 담당하는 Repository
 * - JpaRepository 를 상속하여 기본 CRUD 기능 자동 제공
 * - 메서드 이름 기반 쿼리로 커스텀 조회 구현
 */
public interface ErpScheduleRepository extends JpaRepository<ErpScheduleDTO, Long> {

	// 사원 ID로 일정 조회
    List<ErpScheduleDTO> findByEmpId(String empId);

    // 일정 제목에 키워드가 포함된 일정 조회 (부분 검색)
    List<ErpScheduleDTO> findByErpScheduleTitleContaining(String keyword);

    // 특정 시간 이후의 일정 조회
    List<ErpScheduleDTO> findByEmpIdAndErpScheduleStartAfter(String empId, LocalDateTime time);
}
