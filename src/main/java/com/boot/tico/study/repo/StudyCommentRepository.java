package com.boot.tico.study.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.boot.tico.study.dto.StudyCommentDTO;

@Repository
public interface StudyCommentRepository extends JpaRepository<StudyCommentDTO, Integer> {
    
    /**
     * 최신 댓글 ID를 조회합니다. (없으면 0 반환)
     * @return 가장 큰 댓글 ID
     */
    @Query(value = "SELECT IFNULL(MAX(comment_id), 0) FROM study_comment_tb", nativeQuery = true)
    int getLatestCommentId();
    
    /**
     * 특정 스터디의 댓글과 작성자 닉네임을 조회합니다.
     * @param studyId 조회할 스터디의 ID
     * @return 스터디 댓글 목록
     */
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