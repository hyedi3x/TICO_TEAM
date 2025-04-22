package com.boot.tico.project.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.boot.tico.project.dto.ProjectViewDTO;

@Repository
public interface ProjectViewRepository extends JpaRepository<ProjectViewDTO, Integer>{

	@Query(value = "SELECT IFNULL(MAX(view_id), 0) FROM project_view_tb", nativeQuery = true)
	int getLatestViewId();
}
