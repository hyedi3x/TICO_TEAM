package com.boot.tico.study.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.boot.tico.study.dto.StudyReportDTO;
import com.boot.tico.study.service.StudyReportService;

@RestController
@RequestMapping("/api/studyReport")
public class StudyReportController {

	@Autowired
	private StudyReportService service;
	
	// 신고 접수 내역 저장
	@PostMapping
	public ResponseEntity<?> reportProject(@RequestBody StudyReportDTO reportDto) {
	    try {
	        service.saveProjectReport(reportDto);
	        return ResponseEntity.ok().body("신고가 접수되었습니다.");
	    } catch (Exception e) {
	        return ResponseEntity.status(500).body("신고 처리 실패");
	    }
	}
}
