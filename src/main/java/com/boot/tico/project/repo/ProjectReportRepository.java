package com.boot.tico.project.repo;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.boot.tico.project.dto.ProjectReportDTO;

@Repository
public interface ProjectReportRepository extends JpaRepository<ProjectReportDTO, Integer> {
	/**
     * [1] 가장 마지막 신고내역 ID 반환
     * - 가장 큰 report_id 값을 반환하고, 없으면 0을 반환
     */
	@Query(value = "SELECT IFNULL(MAX(report_id), 0) FROM project_report_tb", nativeQuery = true)
	int getLatestReportId();
	
	@Query("SELECT r FROM ProjectReportDTO r JOIN r.user u WHERE u.name LIKE %:keyword% OR u.nickname LIKE %:keyword%")	// Join Fetch는 엔티티 그래프를 즉시 로딩할 때 사용. JPA는 Page<>를 리턴하는 쿼리에서 JOIN FETCH 사용 시 자동 count 쿼리를 만들지 못합니다.
	Page<ProjectReportDTO> findByUserNameOrNickname(@Param("keyword") String keyword, Pageable pageable);
}
