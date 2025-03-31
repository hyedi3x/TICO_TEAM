package com.boot.tico.project.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import com.boot.tico.project.dto.ProjectDTO;
import com.boot.tico.project.dto.ProjectObjectDTO;

@Mapper
@Repository
public interface ProjectMapper {
	
	// 🔹 가장 최근에 생성된 project_id 조회 (INSERT 시 ID 자동 증가처럼 활용)
	public int getLatestProjectId();
	
	// 🔹 가장 최근에 생성된 object_id 조회 (INSERT 시 object_id 지정 용도)
	public int getLatestObjectId();
	
	// 🔹 새로운 프로젝트 정보 저장
	public int insertProject(ProjectDTO project);
	
	// 🔹 하나의 오브젝트 정보 저장 (해당 프로젝트에 속함)
	public int insertProjectObject(ProjectObjectDTO object);
	
	// 🔹 삭제되지 않은 모든 프로젝트 목록 조회 (isdelete = 'N')
	public List<ProjectDTO> findAllProjects();
	
	// 🔹 특정 project_id에 해당하는 프로젝트 정보 조회
	public ProjectDTO findProjectById(int projectId);
	
	// 🔹 특정 프로젝트에 속한 모든 오브젝트 정보 조회
	public List<ProjectObjectDTO> findObjectsByProjectId(int projectId);
	
	// 🔹 프로젝트 기본 정보 수정 (제목, 소개 등)
	public void updateProject(ProjectDTO project);
	
	// 🔹 오브젝트 정보 수정 (현재는 사용되지 않더라도 확장성 고려)
	public void updateProjectObject(ProjectObjectDTO object);
	
	// 🔹 특정 프로젝트에 속한 오브젝트 전체 삭제 (수정 시 초기화 목적)
	public void deleteObjectsByProjectId(int projectId);
	
	// 🔹 프로젝트 삭제 처리 (isdelete = 'Y'로 소프트 삭제)
	public void deleteProject(int projectId);
}
