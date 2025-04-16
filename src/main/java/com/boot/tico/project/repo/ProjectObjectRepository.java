package com.boot.tico.project.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.boot.tico.project.dto.ProjectObjectDTO;

@Repository
public interface ProjectObjectRepository extends JpaRepository<ProjectObjectDTO, Integer>{
	/**
     * [1] 가장 마지막 오브젝트 ID 반환 (object_id 기준, 없으면 0 반환)
     */
	@Query(value = "SELECT IFNULL(MAX(object_id), 0) FROM project_object_tb", nativeQuery = true)
	int getLatestObjectId();
	
	/**
     * [2] 특정 프로젝트의 오브젝트 리스트 조회
     */
	List<ProjectObjectDTO> findByProjectId(int projectId);
	
	/**
     * [3] 특정 프로젝트의 오브젝트 전체 삭제
     */
    void deleteByProjectId(int projectId);
}
