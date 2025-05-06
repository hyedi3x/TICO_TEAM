package com.boot.tico.project.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.boot.tico.project.dto.ProjectDTO;
import com.boot.tico.project.dto.ProjectReportDTO;
import com.boot.tico.project.service.ProjectReportService;

@RestController
@RequestMapping("api/report")
public class ProjectReportController {
	
	@Autowired
	private ProjectReportService service;
	
	// 신고 접수 내역 저장
	@PostMapping
	public ResponseEntity<?> reportProject(@RequestBody ProjectReportDTO reportDto) {
	    try {
	        service.saveProjectReport(reportDto);
	        return ResponseEntity.ok().body("신고가 접수되었습니다.");
	    } catch (Exception e) {
	        return ResponseEntity.status(500).body("신고 처리 실패");
	    }
	}
	
	// 신고 목록 조회 (검색 + 페이징)
	@GetMapping("/list")
	public ResponseEntity<Page<ProjectReportDTO>> getReportList(
	        @RequestParam(defaultValue = "") String keyword,
	        @RequestParam(defaultValue = "1") int page,
	        @RequestParam(defaultValue = "10") int size
	) {
	    Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Order.desc("createdAt")));

	    Page<ProjectReportDTO> result = keyword.isBlank()
	        ? service.getReportList(pageable)
	        : service.searchByNameOrNickname(keyword, pageable);

	    return ResponseEntity.ok(result);
	}
	
	 // 실제로 신고가 접수된 작품 리스트 (콘텐츠 관리팀 - 작품 관리)
	@GetMapping("/reported-projects")
	public ResponseEntity<?> getReportedProjects() {
	    return ResponseEntity.ok(service.getReportedProjectList());
	}
}
