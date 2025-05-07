package com.boot.tico.study.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.boot.tico.project.dto.ProjectDTO;
import com.boot.tico.study.dto.StudyDTO;
import com.boot.tico.study.service.StudyService;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/study")
public class StudyController {

	@Autowired
	private StudyService service;
	
	// 스터디 등록
    @PostMapping("/create")
    public ResponseEntity<?> createStudy(@RequestBody StudyDTO dto) {
    	service.createStudy(dto);
        return ResponseEntity.ok("스터디 등록 완료");
    }
    
    @GetMapping("/all")
    public ResponseEntity<?> getAllStudies() {
        List<StudyDTO> studies = service.getAllStudies();
        return ResponseEntity.ok(studies);
    }
    
    @GetMapping("/list")
    public ResponseEntity<?> getMyStudies(@RequestParam String userUuid) {
        List<StudyDTO> studies = service.getStudiesByUser(userUuid);
        return ResponseEntity.ok(studies);
    }
    
    @GetMapping("/private")
    public ResponseEntity<?> getPrivateStudies(@RequestParam String userUuid) {
        List<StudyDTO> privateStudies = service.getPrivateStudiesByUser(userUuid);
        return ResponseEntity.ok(privateStudies);
    }
    
    @GetMapping("/public")
    public ResponseEntity<?> getPublicStudies() {
    	List<StudyDTO> publicStudies = service.getPublicStudies();
    	return ResponseEntity.ok(publicStudies);
    }
    
    @PutMapping("/shareStudy")
    public ResponseEntity<?> shareStudy(@RequestBody Map<String, Object> data) {
        try {
        	ObjectMapper mapper = new ObjectMapper();
	        StudyDTO study = mapper.convertValue(data.get("studyInfo"), StudyDTO.class);
            service.shareStudy(study);
            return ResponseEntity.ok("스터디 공유 완료!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("스터디 공유 실패: " + e.getMessage());
        }
    }
    
    @GetMapping("/{studyId}")
    public ResponseEntity<StudyDTO> getStudyDetail(@PathVariable Integer studyId) {
        try {
            StudyDTO study = service.getStudyDetail(studyId);
            if (study != null) {
                return ResponseEntity.ok(study);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
	@PutMapping("/updateMeta")
	public ResponseEntity<?> updateProjectMeta(@RequestBody StudyDTO study) {
		service.updateProjectMeta(study);
	    return ResponseEntity.ok().build();
	}
    
    @PutMapping("/private/{studyId}")
	public ResponseEntity<?> changePrivateStatus(@PathVariable int studyId, @RequestBody Map<String, String> body){
		String isPrivate = body.get("isprivate");
		String isAgree = body.get("isagree");
		service.updatePrivateStatus(studyId, isPrivate, isAgree);
		return ResponseEntity.ok().build();
	}
    
    @DeleteMapping("/{studyId}")
    public ResponseEntity<?> deleteStudy(@PathVariable int studyId) {
        service.deleteStudyById(studyId);
        return ResponseEntity.ok("스터디 삭제 완료");
    }
    
    @PutMapping("/comment/{studyId}")
	public ResponseEntity<?> updateCommentStatus(@PathVariable int studyId, @RequestBody Map<String, String> body) {
	  String isComment = body.get("isComment"); // "Y" 또는 "N"
	  service.updateCommentStatus(studyId, isComment);
	  return ResponseEntity.ok().build();
	}
    
    @PostMapping("/addToMyStudy")
    public ResponseEntity<?> addToMyStudy(@RequestBody Map<String, Object> data) {
        try {
            Integer studyId = (Integer) data.get("studyId");
            String userUuid = (String) data.get("userUuid");
            String duration = (String) data.get("duration");
            String difficulty = (String) data.get("difficulty");

            // 사용자가 다른 사람의 스터디만 추가할 수 있도록 체크
            StudyDTO study = service.getStudyDetail(studyId);
            if (study.getUserUuid().equals(userUuid)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("자신의 스터디는 추가할 수 없습니다.");
            }

            service.addStudyToUser(studyId, userUuid, duration, difficulty);
            return ResponseEntity.ok("스터디가 내 스터디에 추가되었습니다.");
        } catch (Exception e) {
            e.printStackTrace();  // 예외를 출력하여 상세 로그 확인
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("스터디 추가 실패: " + e.getMessage());
        }
    }
}
