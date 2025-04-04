package com.boot.tico.project.controller;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import com.boot.tico.project.dto.ProjectDTO;
import com.boot.tico.project.dto.ProjectObjectDTO;
import com.boot.tico.project.service.ProjectService;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/project")
public class ProjectController {
	
	@Autowired
	private ProjectService service;
	
	private final Logger logger = LoggerFactory.getLogger(ProjectController.class);
	
	// DB에 데이터 삽입
	@PostMapping("/saveProject")
	public ResponseEntity<?> saveProject(@RequestBody Map<String, Object> data) {
		logger.info("<<< url => saveProject >>>");
		
		System.out.println("✅ 받은 전체 데이터: " + data);
		
		// 개별 확인
		System.out.println("📦 projectInfo 원본: " + data.get("projectInfo"));
		System.out.println("📦 objects 원본: " + data.get("objects"));

		try {
			// ObjectMapper를 이용해 Map -> DTO 변환
			ObjectMapper mapper = new ObjectMapper();

			// - 1단계: 프론트에서 전송된 JSON 중 "projectInfo" 키의 값을 꺼냄
		    // - data는 Map<String, Object> 타입으로 가정
		    // - projectInfo는 Map 형태로 들어온 후 → ProjectDTO 객체로 변환
			ProjectDTO project = mapper.convertValue(data.get("projectInfo"), ProjectDTO.class);

			// - 2단계: 프론트에서 보낸 오브젝트 리스트(objects) 가져오기
		    // - data.get("objects")는 List<Map<String, Object>> 형태로 들어옴
			List<Map<String, Object>> objectListMap = (List<Map<String, Object>>) data.get("objects");
			
			// - 3단계: 각 Map 객체를 ProjectObjectDTO 객체로 변환하여 리스트로 수집
		    // - stream() + map() + collect() 사용한 전형적인 변환 패턴
			List<ProjectObjectDTO> objectList = objectListMap.stream()
					.map(obj -> mapper.convertValue(obj, ProjectObjectDTO.class))// 각 map을 DTO로 변환
					.collect(Collectors.toList()); // 리스트로 수집

			// - 4단계: 서비스 계층에 DTO를 전달하여 DB 저장 로직 호출
		    // - 내부적으로 insert 또는 update 처리
			int projectId = service.saveProject(project, objectList);
			
			// - 5단계: 저장 성공 시 클라이언트에 projectId 반환 (200 OK)
			return ResponseEntity.ok(projectId);

		} catch (Exception e) {
			// ❌ 예외 발생 시 로그 기록 + 클라이언트에 500 에러 반환
			logger.error("❌ 프로젝트 저장 중 예외 발생", e);
			return ResponseEntity.status(500).body("프로젝트 저장 실패");
		}
	}
	
	// 리스트(전체 조회)
	@GetMapping("/projectList")
	public ResponseEntity<List<ProjectDTO>> getAll(){
		logger.info("<<< url => getAll() >>>");
		
		List<ProjectDTO> projects = service.getAllProjects();
		return ResponseEntity.ok(projects);
	}
	
	// 상세 조회(1건)
	@GetMapping("/{project_id}")
	public ResponseEntity<?> getProjectDetail(@PathVariable int project_id) {
		logger.info("<<< url => getProjectDetail() >>>");
		
	    Map<String, Object> detail = service.getProjectDetail(project_id);
	    return ResponseEntity.ok(detail);
	}
	
	// 수정 처리
	@PutMapping("/updateProject")
	public ResponseEntity<?> updateProject(@RequestBody Map<String, Object> data) {
	    logger.info("<<< url => updateProject >>>");
	    System.out.println("✅ 받은 전체 데이터: " + data);

	    try {
	        ObjectMapper mapper = new ObjectMapper();

	        // projectInfo → ProjectDTO
	        ProjectDTO project = mapper.convertValue(data.get("projectInfo"), ProjectDTO.class);

	        // objects → List<ProjectObjectDTO>
	        List<Map<String, Object>> objectListMap = (List<Map<String, Object>>) data.get("objects");
	        List<ProjectObjectDTO> objectList = objectListMap.stream()
	                .map(obj -> mapper.convertValue(obj, ProjectObjectDTO.class))
	                .collect(Collectors.toList());

	        // 서비스 호출
	        service.updateProject(project, objectList);
	        return ResponseEntity.ok("업데이트 완료!");
	    } catch (Exception e) {
	        logger.error("❌ 프로젝트 업데이트 중 예외 발생", e);
	        e.printStackTrace();
	        return ResponseEntity.status(500).body("프로젝트 업데이트 실패");
	    }
	}
	
	// 삭제 처리
	@DeleteMapping("/deleteProject/{projectId}")
	public ResponseEntity<?> deleteProject(@PathVariable int projectId){
		logger.info("<<< url => deleteProject >>>");
		
		service.deleteProject(projectId);
		return ResponseEntity.ok().build();
	}
	
	
	// 이미지 서버에 업로드
	@PostMapping("/uploadImage")
	public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
	    try {
	        String imageUrl = service.saveFile(file);  // 💡 로직을 서비스에 위임
	        return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                             .body(Map.of("error", "파일 업로드 실패"));
	    }
	}
}
