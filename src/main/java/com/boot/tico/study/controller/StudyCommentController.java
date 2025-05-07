package com.boot.tico.study.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.boot.tico.study.dto.StudyCommentDTO;
import com.boot.tico.study.service.StudyCommentService;

@RestController
@RequestMapping("/api/studyComments")
public class StudyCommentController {

	@Autowired
	private StudyCommentService service;
	
	/**
     * [1] 댓글 등록
     */
    @PostMapping
    public ResponseEntity<Void> createComment(@RequestBody StudyCommentDTO dto) {
    	service.saveComment(dto);
        return ResponseEntity.ok().build();
    }
    
    /**
     * [2] 특정 작품의 댓글 전체 조회
     */
    @GetMapping("/{studyId}")
    public ResponseEntity<List<StudyCommentDTO>> getComments(@PathVariable int studyId) {
        List<StudyCommentDTO> comments = service.getCommentsByStudyId(studyId);
        return ResponseEntity.ok(comments);
    }

}
