package com.boot.tico.search.service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.boot.tico.project.dto.ProjectCommentDTO;
import com.boot.tico.project.repo.ProjectCommentRepository;
import com.boot.tico.project.repo.ProjectRepository;
import com.boot.tico.search.repo.SearchRepository;

@Service
public class SearchService {

	@Autowired
	private ProjectRepository project;
	
	@Autowired
	private ProjectCommentRepository comment;
	
	@Autowired
    private SearchRepository search;

    public Map<String, Object> searchAll(String keyword) {
        Map<String, Object> result = new HashMap<>();
        result.put("projects", project.searchProjects(keyword));
        result.put("pages", search.searchPages(keyword));
        
        // JOIN 결과를 DTO로 변환
        List<Object[]> rawComments = comment.searchProjectComments(keyword);
        List<ProjectCommentDTO> commentList = new ArrayList<>();
        for(Object[] arr : rawComments){
            ProjectCommentDTO dto = new ProjectCommentDTO();
            dto.setCommentId((Integer) arr[0]);
            dto.setProjectId((Integer) arr[1]);
            dto.setUserUuid((String) arr[2]);
            dto.setCommentText((String) arr[3]);
            dto.setCreatedAt((Timestamp) arr[4]);
            dto.setNickname((String) arr[5]);
            dto.setTitle((String) arr[6]);
            commentList.add(dto);
        }
        result.put("comments", commentList);
        return result;
    }
	
}
