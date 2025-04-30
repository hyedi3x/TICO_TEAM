package com.boot.tico.project.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.boot.tico.project.dto.ProjectStaffPickDTO;

@Repository
public interface ProjectStaffPickRepository extends JpaRepository<ProjectStaffPickDTO, Integer>{
	
	Optional<ProjectStaffPickDTO> findBySlotIndex(int slotIndex);
    
	void deleteByProjectId(int projectId);
    
    List<ProjectStaffPickDTO> findAllByOrderBySlotIndex();
    
    @Query("SELECT COALESCE(MAX(p.pickId), 1) FROM ProjectStaffPickDTO p")
    int findMaxPickId();
}
