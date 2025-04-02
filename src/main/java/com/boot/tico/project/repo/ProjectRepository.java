package com.boot.tico.project.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.boot.tico.project.dto.ProjectDTO;

@Repository
public interface ProjectRepository extends JpaRepository<ProjectDTO, Integer>{
	@Query(value = "SELECT IFNULL(MAX(project_id), 0) FROM project_tb", nativeQuery = true)
	int getLatestProjectId();
	@Query(value = "SELECT * FROM project_tb WHERE isdelete = 'N' ORDER BY project_id", nativeQuery = true)
	List<ProjectDTO> findByIsDelete(String isDelete); // "N"이면 살아있는 것만
}
