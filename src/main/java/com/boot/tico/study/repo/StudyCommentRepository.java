package com.boot.tico.study.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.boot.tico.study.dto.StudyCommentDTO;

@Repository
public interface StudyCommentRepository extends JpaRepository<StudyCommentDTO, Integer>{
	@Query(value = "SELECT IFNULL(MAX(comment_id), 0) FROM study_comment_tb", nativeQuery = true)
	int getLatestCommentId();
	
	@Query(value = """
		    SELECT 
		        c.comment_id,
		        c.study_id,
		        c.user_uuid,
		        c.comment_text,
		        c.created_at,
		        u.nickname
		    FROM study_comment_tb c
		    JOIN users u ON c.user_uuid = u.user_uuid
		    WHERE c.study_id = :studyId
		    ORDER BY c.created_at DESC
		""", nativeQuery = true)
		List<Object[]> findByStudyIdWithNickname(@Param("studyId") int studyId);

}
