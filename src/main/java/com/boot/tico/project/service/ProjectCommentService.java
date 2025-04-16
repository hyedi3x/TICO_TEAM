package com.boot.tico.project.service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.boot.tico.project.dto.ProjectCommentDTO;
import com.boot.tico.project.repo.ProjectCommentRepository;
import com.boot.tico.project.repo.ProjectRepository;

@Service
public class ProjectCommentService {

	@Autowired
	private ProjectCommentRepository repository;
	
	@Autowired
	private ProjectRepository projectRepository;
	
	/**
     * 댓글 등록
     */
    public void saveComment(ProjectCommentDTO commentDTO) {
    	int newCommentId = repository.getLatestCommentId() + 1;
    	commentDTO.setCommentId(newCommentId);
    	repository.save(commentDTO);
    	projectRepository.updateCommentCount(commentDTO.getProjectId());
    }

    /**
     * 특정 프로젝트에 대한 댓글 전체 조회
     */
    public List<ProjectCommentDTO> getCommentsByProjectId(int projectId) {
        List<Object[]> results = repository.findByProjectIdWithNickname(projectId);
        List<ProjectCommentDTO> comments = new ArrayList<>();

        for (Object[] row : results) {
            ProjectCommentDTO dto = new ProjectCommentDTO();
            dto.setCommentId(((Number) row[0]).intValue());
            dto.setProjectId(((Number) row[1]).intValue());
            dto.setUserUuid((String) row[2]);
            dto.setCommentText((String) row[3]);
            dto.setCreatedAt(((Timestamp) row[4]));
            dto.setNickname((String) row[5]);
            comments.add(dto);
        }

        return comments;
    }

}
