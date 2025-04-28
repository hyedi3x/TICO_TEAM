package com.boot.tico.project.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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
}
