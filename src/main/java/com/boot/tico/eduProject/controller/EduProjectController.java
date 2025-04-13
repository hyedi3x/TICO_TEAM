package com.boot.tico.eduProject.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.boot.tico.eduProject.dto.EduProjectDTO;
import com.boot.tico.eduProject.service.EduProjectServiceImpl;

@RestController //Controller + ResponseBody (Java 객체를 JSON이나 XML과 같은 형식으로 변환하여 응답 본문에 작성)
@RequestMapping("/eduBlock")
public class EduProjectController {
	
	@Autowired
	private EduProjectServiceImpl eduservice;
	
	@PostMapping("/Postquiz")
    public ResponseEntity<?> postEduQuiz(@RequestBody EduProjectDTO dto) {
	 	System.out.println("<<< postEduQuiz >>>");
	 	return new ResponseEntity<>(eduservice.save(dto), HttpStatus.OK);
	 								// 응답 본문 (body) , 응답 상태
    }
	
}
