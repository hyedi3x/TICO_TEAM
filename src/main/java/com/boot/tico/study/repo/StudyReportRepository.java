package com.boot.tico.study.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.boot.tico.study.dto.StudyReportDTO;

@Repository
public interface StudyReportRepository extends JpaRepository<StudyReportDTO, Integer> {
	
	// 현재까지 저장된 가장 큰 신고 PK값 반환 (없으면 0)
	@Query(value = "SELECT IFNULL(MAX(report_id), 0) FROM study_report_tb", nativeQuery = true)
	int getLatestReportId();
}
