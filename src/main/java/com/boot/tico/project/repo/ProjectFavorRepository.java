package com.boot.tico.project.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.boot.tico.project.dto.ProjectFavorDTO;

@Repository
public interface ProjectFavorRepository extends JpaRepository<ProjectFavorDTO, Integer> {
	/**
     * [1] 가장 마지막 favor_id 반환 (없으면 0)
     */
    @Query(value = "SELECT IFNULL(MAX(favor_id), 0) FROM project_favor_tb", nativeQuery = true)
    int getLatestFavorId();
    
    /**
     * [2] 특정 유저가 특정 프로젝트에 해당 타입(favor_type)의 좋아요 or 북마크 했는지 여부
     */
    @Query(value = """
    	    SELECT COUNT(*) FROM project_favor_tb
    	    WHERE project_id = :projectId
    	      AND user_uuid = :userUuid
    	      AND favor_type = :favorType
    	""", nativeQuery = true)
    	int countFavor(@Param("projectId") int projectId,
    	                   @Param("userUuid") String userUuid,
    	                   @Param("favorType") String favorType);

    /**
     * [3] 토글 처리를 위한 delete
     */
    @Modifying
    @Transactional
    @Query(value = """
        DELETE FROM project_favor_tb
        WHERE project_id = :projectId
          AND user_uuid = :userUuid
          AND favor_type = :favorType
        """, nativeQuery = true)
    void deleteFavor(@Param("projectId") int projectId,
                     @Param("userUuid") String userUuid,
                     @Param("favorType") String favorType);
}
