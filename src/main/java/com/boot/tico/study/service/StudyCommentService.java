package com.boot.tico.study.service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.boot.tico.study.dto.StudyCommentDTO;
import com.boot.tico.study.repo.StudyCommentRepository;

@Service
public class StudyCommentService {
	
	@Autowired
	private StudyCommentRepository repository;

	/**
     * 댓글 등록
     */
    public void saveComment(StudyCommentDTO commentDTO) {
    	int newCommentId = repository.getLatestCommentId() + 1;
    	commentDTO.setCommentId(newCommentId);
    	repository.save(commentDTO);
    }
    
    /**
     * 특정 스터디에 대한 댓글 전체 조회
     */
    public List<StudyCommentDTO> getCommentsByStudyId(int studyId) {
        List<Object[]> results = repository.findByStudyIdWithNickname(studyId);
        List<StudyCommentDTO> comments = new ArrayList<>();

        for (Object[] row : results) {
        	StudyCommentDTO dto = new StudyCommentDTO();
            dto.setCommentId(((Number) row[0]).intValue());
            dto.setStudyId(((Number) row[1]).intValue());
            dto.setUserUuid((String) row[2]);
            dto.setCommentText((String) row[3]);
            dto.setCreatedAt(((Timestamp) row[4]));
            dto.setNickname((String) row[5]);
            comments.add(dto);
        }

        return comments;
    }

}
