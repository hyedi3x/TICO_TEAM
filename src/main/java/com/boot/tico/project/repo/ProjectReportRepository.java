package com.boot.tico.project.repo;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.boot.tico.project.dto.ProjectReportDTO;

@Repository
public interface ProjectReportRepository extends JpaRepository<ProjectReportDTO, Integer> {
	
	// 현재까지 저장된 가장 큰 신고 PK값 반환 (없으면 0)
	@Query(value = "SELECT IFNULL(MAX(report_id), 0) FROM project_report_tb", nativeQuery = true)
	int getLatestReportId();
	
	// 이름 또는 닉네임으로 사용자 검색
	@Query("SELECT r FROM ProjectReportDTO r JOIN r.user u WHERE u.name LIKE %:keyword% OR u.nickname LIKE %:keyword%")	// Join Fetch는 엔티티 그래프를 즉시 로딩할 때 사용. JPA는 Page<>를 리턴하는 쿼리에서 JOIN FETCH 사용 시 자동 count 쿼리를 만들지 못합니다.
	Page<ProjectReportDTO> findByUserNameOrNickname(@Param("keyword") String keyword, Pageable pageable);
	
	// 중복 없는 신고 대상 프로젝트 ID 목록
	@Query("SELECT DISTINCT r.projectId FROM ProjectReportDTO r")
	List<Integer> findDistinctReportedProjectIds();
	
	// 신고된 프로젝트 상세 정보 조회
	@Query(value = """
  		SELECT p.project_id, p.title, p.thumbnail_url, u.nickname
          FROM project_tb p
          JOIN users u ON p.user_uuid = u.user_uuid
         WHERE p.project_id IN (:ids)
           AND isdelete = 'N'
        """, nativeQuery = true)
	List<Map<String, Object>> findReportedProjects(@Param("ids") List<Integer> ids);
}
