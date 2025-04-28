package com.boot.tico.project.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.boot.tico.project.dto.ProjectCommentDTO;

@Repository
public interface ProjectCommentRepository extends JpaRepository<ProjectCommentDTO, Integer> {
	@Query(value = "SELECT IFNULL(MAX(comment_id), 0) FROM project_comment_tb", nativeQuery = true)
	int getLatestCommentId();
	
	@Query(value = """
		    SELECT 
		        c.comment_id,
		        c.project_id,
		        c.user_uuid,
		        c.comment_text,
		        c.created_at,
		        u.nickname
		    FROM project_comment_tb c
		    JOIN users u ON c.user_uuid = u.user_uuid
		    WHERE c.project_id = :projectId
		    ORDER BY c.created_at ASC
		""", nativeQuery = true)
		List<Object[]> findByProjectIdWithNickname(@Param("projectId") int projectId);
		
		@Query(value = """
			    SELECT 
			        c.comment_id,
			        c.project_id,
			        c.user_uuid,
			        c.comment_text,
			        c.created_at,
			        u.nickname,
			        p.title
			    FROM project_comment_tb c
			    JOIN users u ON c.user_uuid = u.user_uuid
			    JOIN project_tb p ON c.project_id = p.project_id
			    WHERE c.comment_text LIKE %:keyword%
			    ORDER BY c.created_at DESC
			""", nativeQuery = true)
			List<Object[]> searchProjectComments(@Param("keyword") String keyword);

}