package com.boot.tico.project.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.boot.tico.project.dto.ProjectDTO;
import com.boot.tico.project.dto.ProjectReportDTO;
import com.boot.tico.project.repo.ProjectReportRepository;
import com.boot.tico.project.repo.ProjectRepository;

@Service
public class ProjectReportService {
	
	@Autowired
	private ProjectReportRepository repo;
	
	@Autowired
    private ProjectRepository projectRepo;
	
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
   
   // 신고된 프로젝트들의 ID만 추출 (중복 제거)
   public List<Integer> getReportedProjectIds() {
       return repo.findDistinctReportedProjectIds();
   }
   
   // 실제 신고가 접수된 프로젝트 리스트 조회 (프로젝트 정보 + 닉네임)
   public List<ProjectDTO> getReportedProjectList() {
	    List<Integer> ids = getReportedProjectIds();
	    if (ids.isEmpty()) return List.of();

	    List<Map<String, Object>> rawList = repo.findReportedProjects(ids);

	    List<ProjectDTO> result = new ArrayList<>();
	    for (Map<String, Object> row : rawList) {
	        ProjectDTO dto = new ProjectDTO();
	        dto.setProjectId(((Number) row.get("project_id")).intValue());
	        dto.setTitle((String) row.get("title"));
	        dto.setThumbnailUrl((String) row.get("thumbnail_url"));
	        dto.setNickname((String) row.get("nickname"));
	        result.add(dto);
	    }

	    return result;
	}
}
