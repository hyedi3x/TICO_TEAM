package com.boot.tico.eduProject.controller;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.boot.tico.eduProject.dto.EduProjectDTO;
import com.boot.tico.eduProject.service.EduProjectService;
import com.boot.tico.quiz.controller.QuizController;

@RestController //Controller + ResponseBody (Java 객체를 JSON이나 XML과 같은 형식으로 변환하여 응답 본문에 작성)
@RequestMapping("/api/eduBlock")
public class EduProjectController {
	
	@Autowired
	private EduProjectService eduservice;
	
	private static final Logger logger = LoggerFactory.getLogger(EduProjectController.class);
	
	@PostMapping("/PostQuiz")
    public ResponseEntity<?> postEduQuiz(@RequestBody EduProjectDTO dto) {
		logger.info("<<< Controller - Postquiz() >>>");
	 	return new ResponseEntity<>(eduservice.save(dto), HttpStatus.OK);
	 								// 응답 본문 (body) , 응답 상태
    }
	
	// @PatchMapping은 전체가 아닌 일부를 수정할 때 적절, 삭제도 있지만 간단한 코드라 가독성을 우선시함
	@PatchMapping("/manageQuiz")
	public ResponseEntity<String> manageQuiz(@RequestBody Map<String, Object> map) {
		logger.info("<<< Controller - manageQuiz() >>>");
		int quiz_id = Integer.parseInt(String.valueOf(map.get("quiz_id")));
	    String action = String.valueOf(map.get("action"));
		return new ResponseEntity<>(eduservice.manageQuiz(quiz_id, action), HttpStatus.OK);
	}
}
