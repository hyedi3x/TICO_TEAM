package com.boot.tico.project.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.boot.tico.project.dao.ProjectMapper;
import com.boot.tico.project.dto.ProjectDTO;
import com.boot.tico.project.dto.ProjectObjectDTO;

@Service
public class ProjectService {

	@Autowired
	private ProjectMapper projectMapper;
	
	// 작품 + 그 작품의 요소 정보 저장(블록, 요소의 위치 등등)
	@Transactional
	public int saveProject(ProjectDTO project, List<ProjectObjectDTO> objectList) {
		System.out.println("ProjectService - saveProject()");
		
		int latestProjectId = projectMapper.getLatestProjectId() + 1; // max + 1
	    project.setProject_id(latestProjectId); // 수동 지정
	    
		projectMapper.insertProject(project);
		
		for(ProjectObjectDTO obj : objectList) {
			int nextObjectId = projectMapper.getLatestObjectId() + 1;
		    obj.setObject_id(nextObjectId);
			obj.setProject_id(latestProjectId);
			System.out.println(obj.getUrl());
			projectMapper.insertProjectObject(obj);
		}
		
		return latestProjectId;
	}
	
	// 모든 작품들 정보를 조회(작품 목록)
	@Transactional
	public List<ProjectDTO> getAllProjects(){
		System.out.println("ProjectService - getAllprojects()()");
		
		return projectMapper.findAllProjects();
	}
	
	// 작품 상세 조회(1건)
	@Transactional(readOnly = true)
	public Map<String, Object> getProjectDetail(int projectId) {
		System.out.println("ProjectService - getProjectDetail()");
		
	    ProjectDTO project = projectMapper.findProjectById(projectId);
	    List<ProjectObjectDTO> objects = projectMapper.findObjectsByProjectId(projectId);

	    Map<String, Object> result = new HashMap<>();
	    result.put("project", project);
	    result.put("objects", objects);
	    return result;
	}
	
	// 작품 수정 처리
	@Transactional
	public void updateProject(ProjectDTO project, List<ProjectObjectDTO> objectList) {
		System.out.println("ProjectService - updateProject()");
		
		int projectId = project.getProject_id();
		if(projectId == 0) {
			throw new IllegalArgumentException("프로젝트 ID가 없습니다. 업데이트 불가");
		}
		
		// 1. 작품 정보 업데이트
	    projectMapper.updateProject(project);

	    // 2. 해당 작품의 존재하는 요소 전부 delete(요소가 추가될 수 있기 때문)
	    projectMapper.deleteObjectsByProjectId(project.getProject_id());

	    // 3. 요소들 insert
	    for (ProjectObjectDTO obj : objectList) {
	        int nextObjectId = projectMapper.getLatestObjectId() + 1;
	        obj.setObject_id(nextObjectId);
	        obj.setProject_id(project.getProject_id());
	        projectMapper.insertProjectObject(obj);
	    }
	}
	
	// 작품 삭제 처리(요소는 DB에서 DELETE, 작품은 UPDATE로 is_delete='Y')
	@Transactional
	public void deleteProject(int projectId) {
		System.out.println("ProjectService - deleteProject()");
		
		if(projectId == 0) {
			throw new IllegalArgumentException("프로젝트 ID가 없습니다. 삭제 불가");
		}
		
		projectMapper.deleteObjectsByProjectId(projectId);
		projectMapper.deleteProject(projectId);
	}
}
