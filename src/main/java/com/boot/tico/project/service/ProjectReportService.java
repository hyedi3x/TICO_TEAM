package com.boot.tico.project.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.boot.tico.project.dto.ProjectReportDTO;
import com.boot.tico.project.repo.ProjectReportRepository;

@Service
public class ProjectReportService {
	
	@Autowired
	private ProjectReportRepository repo;
	
   // 신고내역 저장
   @Transactional
   public void saveProjectReport(ProjectReportDTO dto) {
	   // 신고내역 ID 수동 생성
       int newReportId = repo.getLatestReportId() + 1;
       dto.setReportId(newReportId);
       repo.save(dto);
   }
   
   // [관리자] 신고 내역 목록 조회(전체)
   public Page<ProjectReportDTO> getReportList(Pageable pageable) {
       return repo.findAll(pageable);
   }
   
   // [관리자] 신고 내역 목록 조회(검색)
   public Page<ProjectReportDTO> searchByNameOrNickname(String keyword, Pageable pageable) {
       return repo.findByUserNameOrNickname(keyword, pageable);
   }
}
