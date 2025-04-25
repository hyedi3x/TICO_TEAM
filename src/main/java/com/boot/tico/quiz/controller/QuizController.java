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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.boot.tico.quiz.dto.QuizDTO;
import com.boot.tico.quiz.dto.SolvedDTO;
import com.boot.tico.quiz.service.QuizService;

@RestController
@RequestMapping("/api/quiz")
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
	
	@GetMapping("/answer")
	public ResponseEntity<?> getAnswerXml(@RequestParam("quizId") int quizId) {
		logger.info("<<< Controller - getAnswerXml() >>>");
	    return new ResponseEntity<>(service.findByQuizId(quizId), HttpStatus.CREATED);
	}
	
	@PutMapping("/eduQuiz")
	public ResponseEntity<?> putSolvedQuiz(@RequestBody SolvedDTO dto){
		logger.info("<<< Controller - putSolvedQuiz() >>>");
		return new ResponseEntity<>(service.solvedQuizPut(dto), HttpStatus.OK);
	}
}
