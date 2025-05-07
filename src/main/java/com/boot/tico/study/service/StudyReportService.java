package com.boot.tico.study.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.boot.tico.study.dto.StudyReportDTO;
import com.boot.tico.study.repo.StudyReportRepository;

@Service
public class StudyReportService {

	@Autowired
	private StudyReportRepository repo;
	
	// 신고내역 저장
   @Transactional
   public void saveProjectReport(StudyReportDTO dto) {
	   // 신고내역 ID 수동 생성
       int newReportId = repo.getLatestReportId() + 1;
       dto.setReportId(newReportId);
       repo.save(dto);
   }
}
