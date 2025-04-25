package com.boot.tico.project.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.boot.tico.project.dto.ProjectCommentDTO;
import com.boot.tico.project.service.ProjectCommentService;

@RestController
@RequestMapping("/api/projectComments")
public class ProjectCommentController {

	@Autowired
	private ProjectCommentService service;
	
	/**
     * [1] 댓글 등록
     */
    @PostMapping
    public ResponseEntity<Void> createComment(@RequestBody ProjectCommentDTO dto) {
    	service.saveComment(dto);
        return ResponseEntity.ok().build();
    }

    /**
     * [2] 특정 작품의 댓글 전체 조회
     */
    @GetMapping("/{projectId}")
    public ResponseEntity<List<ProjectCommentDTO>> getComments(@PathVariable int projectId) {
        List<ProjectCommentDTO> comments = service.getCommentsByProjectId(projectId);
        return ResponseEntity.ok(comments);
    }
}
