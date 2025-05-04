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
import com.boot.tico.project.dto.ProjectReportDTO;
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
@RequestMapping("/api/project")
public class ProjectController {
	
	@Autowired
	private ProjectService service;
	
	private final Logger logger = LoggerFactory.getLogger(ProjectController.class);
	
	 /**
     * [1] 프로젝트 + 오브젝트 저장
     * 프론트에서 보낸 projectInfo / objects를 저장하고 새 projectId 반환
     */
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
			int projectNum = service.saveProject(project, objectList);
			
			// - 5단계: 저장 성공 시 클라이언트에 projectId 반환 (200 OK)
			return ResponseEntity.ok(projectNum);

		} catch (Exception e) {
			// ❌ 예외 발생 시 로그 기록 + 클라이언트에 500 에러 반환
			logger.error("❌ 프로젝트 저장 중 예외 발생", e);
			return ResponseEntity.status(500).body("프로젝트 저장 실패");
		}
	}
	
	 /**
     * [2] 전체 프로젝트 목록 조회 (is_delete = 'N')
     */
	@GetMapping("/projectList")
	public ResponseEntity<List<ProjectDTO>> getAll(){
		logger.info("<<< url => getAll() >>>");
		
		List<ProjectDTO> projects = service.getAllProjects();
		return ResponseEntity.ok(projects);
	}
	
	/**
     * [3] 로그인한 유저의 프로젝트 목록 조회
     */
	@GetMapping("/userProjects/{userUuid}")
	public ResponseEntity<List<ProjectDTO>> getUserProjects(@PathVariable String userUuid) {
	    logger.info("<<< url => getUserProjects >>>");
	    
	    List<ProjectDTO> projects = service.getProjectsByUser(userUuid);
	    return ResponseEntity.ok(projects);
	}
	
	/**
     * [4] 프로젝트 상세 조회 (project + object 함께 반환)
     */
	@GetMapping("/{project_id}")
	public ResponseEntity<?> getProjectDetail(@PathVariable int project_id) {
		logger.info("<<< url => getProjectDetail() >>>");
		
	    Map<String, Object> detail = service.getProjectDetail(project_id);
	    return ResponseEntity.ok(detail);
	}
	
	/**
     * [5] 프로젝트 + 오브젝트 수정
     */
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
	        int number = service.updateProject(project, objectList);
	        return ResponseEntity.ok(number);
	    } catch (Exception e) {
	        logger.error("❌ 프로젝트 업데이트 중 예외 발생", e);
	        e.printStackTrace();
	        return ResponseEntity.status(500).body("프로젝트 업데이트 실패");
	    }
	}
	
	/**
     * [6] 프로젝트 삭제 (object 삭제 + project의 is_delete = 'Y')
     */
	@DeleteMapping("/deleteProject/{projectId}")
	public ResponseEntity<?> deleteProject(@PathVariable int projectId){
		logger.info("<<< url => deleteProject >>>");
		
		int deleteNum = service.deleteProject(projectId);
		return ResponseEntity.ok(deleteNum);
	}
	
	
	/**
     * [7] 이미지 업로드 (업로드 폴더에 저장 후 이미지 URL 반환)
     */
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
	
	 /**
     * [8] 공개된 프로젝트 목록 조회 (isPrivate = 'N')
     */
	@GetMapping("/public")
	public ResponseEntity<List<ProjectDTO>> getPublicProjects() {
	    List<ProjectDTO> list = service.getPublicProjects();
	    return ResponseEntity.ok(list);
	}
	
	/**
     * [9] 프로젝트 공유 처리 (isPrivate = 'N', isAgree = 'Y'로 전환)
     */
	@PutMapping("/shareProject")
	public ResponseEntity<?> shareProject(@RequestBody Map<String, Object> data) {
	    try {
	        ObjectMapper mapper = new ObjectMapper();
	        ProjectDTO project = mapper.convertValue(data.get("projectInfo"), ProjectDTO.class);

	        service.shareProject(project);
	        return ResponseEntity.ok("공유 완료!");
	    } catch (Exception e) {
	        return ResponseEntity.status(500).body("공유 실패");
	    }
	}

	/**
	 * [10] 조회수 증가
	 */
	@PostMapping("/view/{projectId}")
	public ResponseEntity<?> addView(@PathVariable int projectId, @RequestParam(required = false) String userUuid) {
		if (userUuid != null && !userUuid.isEmpty()) {
	        service.recordUserView(projectId, userUuid); // 로그인된 경우 uuid까지 같이 기록
	    } else {
	        service.recordUserView(projectId, null); // 로그인 안 한 경우 null로 기록
	    }
	    service.incrementViewCount(projectId); // 로그인 여부와 관계없이 조회수 증가
	    return ResponseEntity.ok("조회 기록 저장 완료");
	}
	
	/**
	 * [11] 공개/비공개 전환
	 */
	@PutMapping("/private/{projectId}")
	public ResponseEntity<?> changePrivateStatus(@PathVariable int projectId, @RequestBody Map<String, String> body){
		String isPrivate = body.get("isPrivate");
		String isAgree = body.get("isAgree");
		service.updatePrivateStatus(projectId, isPrivate, isAgree);
		return ResponseEntity.ok().build();
	}
	
	/**
	 * [12] 댓글 허용/비허용 전환
	 */
	@PutMapping("/comment/{projectId}")
	public ResponseEntity<?> updateCommentStatus(@PathVariable int projectId, @RequestBody Map<String, String> body) {
	  String isComment = body.get("isComment"); // "Y" 또는 "N"
	  service.updateCommentStatus(projectId, isComment);
	  return ResponseEntity.ok().build();
	}
	
	/**
	 * [13] 작품의 정보만 수정(작품 상세페이지 또는 마이페이지 - 수정하기) 
	 */
	@PutMapping("/updateMeta")
	public ResponseEntity<?> updateProjectMeta(@RequestBody ProjectDTO project) {
		service.updateProjectMeta(project);
	    return ResponseEntity.ok().build();
	}

	/**
	 * [14] 신고 접수 내역 추가
	 */
	@PostMapping("/report")
	public ResponseEntity<?> reportProject(@RequestBody ProjectReportDTO reportDto) {
	    try {
	        service.saveProjectReport(reportDto);
	        return ResponseEntity.ok().body("신고가 접수되었습니다.");
	    } catch (Exception e) {
	        return ResponseEntity.status(500).body("신고 처리 실패");
	    }
	}
	
	// 메인화면 전체 작품 가져오기 (닉네임 포함
	@GetMapping("/projects")
	public ResponseEntity<List<ProjectDTO>> projects(){
		logger.info("<<< url => projects() >>>");
		
		List<ProjectDTO> projects = service.getProjects();
		return ResponseEntity.ok(projects);
	}
	// 메인화면 인기 작품 조회
	// ProjectController.java
	@GetMapping("/popularProjects")
	public ResponseEntity<List<ProjectDTO>> getPopularProjects() {
	    List<ProjectDTO> projects = service.getPopularProjects();
	    return ResponseEntity.ok(projects);
	}
}
