package com.boot.tico.project.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.boot.tico.project.dto.ProjectObjectDTO;

@Repository
public interface ProjectObjectRepository extends JpaRepository<ProjectObjectDTO, Integer>{
	@Query(value = "SELECT IFNULL(MAX(object_id), 0) FROM project_object_tb", nativeQuery = true)
	int getLatestObjectId();
	List<ProjectObjectDTO> findByProjectId(int projectId);
    void deleteByProjectId(int projectId);
}
