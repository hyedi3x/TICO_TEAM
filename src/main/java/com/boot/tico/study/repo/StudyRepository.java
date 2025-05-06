package com.boot.tico.study.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.boot.tico.study.dto.StudyDTO;

@Repository
public interface StudyRepository extends JpaRepository<StudyDTO, Integer> {

	@Query(value = "SELECT IFNULL(MAX(study_id), 0) FROM study_tb", nativeQuery = true)
    int getLatestStudyId();

    @Query(value = "SELECT COUNT(*) FROM study_tb WHERE user_uuid = :userUuid AND isdelete = 'N'", nativeQuery = true)
    int countByUserUuid(@Param("userUuid") String userUuid);
    
    @Query(value = "SELECT * FROM study_tb ORDER BY created_at DESC AND isdelete = 'N'", nativeQuery = true)
    List<StudyDTO> findAllStudies();
    
    @Query(value = """
	    		SELECT 
				    s.study_id, 
				    s.title, 
				    s.introduction, 
				    s.category, 
				    s.difficulty, 
				    s.duration, 
				    s.isprivate,
				    p.thumbnail_url AS thumbnailUrl
				FROM study_tb s
				LEFT JOIN project_tb p ON s.project_id = p.project_id
				WHERE s.user_uuid = :userUuid
				  AND s.isdelete = 'N'
    		""", nativeQuery = true)
    List<Object[]> findStudiesByUser(@Param("userUuid") String userUuid);
    
    @Query(value = """
            SELECT 
                s.study_id, 
                s.title, 
                s.introduction, 
                s.goal,
                s.category, 
                s.difficulty, 
                s.duration, 
                s.isprivate,
                p.thumbnail_url AS thumbnailUrl
            FROM study_tb s
            LEFT JOIN project_tb p ON s.project_id = p.project_id
            WHERE s.user_uuid = :userUuid 
              AND s.isprivate = 'Y'
              AND s.isdelete = 'N'
            """, nativeQuery = true)
       List<Object[]> findPrivateStudiesByUser(@Param("userUuid") String userUuid);
       
       @Query(value = """
    		    SELECT 
    		        s.study_id, 
    		        s.title, 
    		        s.introduction, 
    		        s.category, 
    		        s.difficulty, 
    		        s.duration, 
    		        s.isprivate,
    		        u.nickname,
    		        p.thumbnail_url AS thumbnailUrl
    		    FROM study_tb s
    		    LEFT JOIN project_tb p ON s.project_id = p.project_id
    		    LEFT JOIN users u ON s.user_uuid = u.user_uuid
    		    WHERE s.isprivate = 'N'
    		      AND s.isdelete = 'N'
    		    ORDER BY s.created_at DESC
    		    """, nativeQuery = true)
		List<Object[]> findPublicStudies();
		
		@Modifying
		@Transactional
		@Query("UPDATE StudyDTO s SET " +
		       "s.category = :category, " +
		       "s.introduction = :introduction, " +
		       "s.goal = :goal, " +
		       "s.difficulty = :difficulty, " +
		       "s.duration = :duration, " +
		       "s.isagree = :isagree, " +
		       "s.isprivate = :isprivate " +
		       "WHERE s.studyId = :studyId")
		void updateShareInfo(
		    @Param("studyId") Integer studyId,
		    @Param("category") String category,
		    @Param("introduction") String introduction,
		    @Param("goal") String goal,
		    @Param("difficulty") String difficulty,
		    @Param("duration") String duration,
		    @Param("isagree") String isagree,
		    @Param("isprivate") String isprivate
		);

}
