package com.boot.tico.quiz.controller;


import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.boot.tico.quiz.dto.QuizDTO;
import com.boot.tico.quiz.dto.SolvedDTO;
import com.boot.tico.quiz.service.QuizService;

@RestController
@RequestMapping("/quiz")
public class QuizController {
	
	@Autowired
	private QuizService service;
	
	private static final Logger logger = LoggerFactory.getLogger(QuizController.class);
	
	@GetMapping("/eduList")
	public ResponseEntity<?> getQuiz(){
		logger.info("<<< Controller - getQuiz() >>>");
		Map<String,Object> map = new HashMap<>();
		try {
			List<QuizDTO> quizDto = service.findAllQuiz();
			List<SolvedDTO> solvedDTO = service.findAllSolved();
			map.put("quizDTO", quizDto);
			map.put("solvedDTO", solvedDTO);
			return new ResponseEntity<>(map, HttpStatus.CREATED);
		} catch (Exception e) {
			logger.error("데이터 조회 중 오류 발생", e);
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                .body(Map.of("error", "데이터 조회에 실패했습니다."));
		}
	}
}
