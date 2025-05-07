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

    /**
     * 최신 스터디 ID를 조회합니다. (없으면 0 반환)
     * @return 가장 큰 study ID
     */
    @Query(value = "SELECT IFNULL(MAX(study_id), 0) FROM study_tb", nativeQuery = true)
    int getLatestStudyId();

    /**
     * 특정 사용자가 만든 스터디 수를 계산합니다.
     * @param userUuid 사용자의 UUID
     * @return 해당 사용자가 만든 스터디 수
     */
    @Query(value = "SELECT COUNT(*) FROM study_tb WHERE user_uuid = :userUuid AND isdelete = 'N'", nativeQuery = true)
    int countByUserUuid(@Param("userUuid") String userUuid);
    
    /**
     * 모든 스터디 목록을 조회합니다.
     * @return 모든 스터디의 목록
     */
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
        WHERE s.isdelete = 'N'
    """, nativeQuery = true)
    List<Object[]> findAllStudies();

    /**
     * 특정 사용자가 만든 스터디 목록을 조회합니다.
     * @param userUuid 사용자의 UUID
     * @return 해당 사용자의 스터디 목록
     */
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

    /**
     * 특정 사용자의 비공개 스터디 목록을 조회합니다.
     * @param userUuid 사용자의 UUID
     * @return 해당 사용자의 비공개 스터디 목록
     */
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

    /**
     * 공개 스터디 목록을 조회합니다.
     * @return 공개 스터디 목록
     */
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
        ORDER BY s.created_at ASC
    """, nativeQuery = true)
    List<Object[]> findPublicStudies();
    
    /**
     * 스터디의 공유 정보를 업데이트합니다.
     * @param studyId 스터디 ID
     * @param category 카테고리
     * @param introduction 소개글
     * @param goal 목표
     * @param difficulty 난이도
     * @param duration 소요 시간
     * @param isagree 동의 여부
     * @param isprivate 공개 여부
     */
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

    /**
     * 스터디의 비공개 상태와 동의 여부를 업데이트합니다.
     * @param studyId 스터디 ID
     * @param isPrivate 비공개 여부
     * @param isAgree 동의 여부
     */
    @Modifying
    @Transactional
    @Query(value = "UPDATE study_tb SET isprivate = :isPrivate, isagree = :isAgree WHERE study_id = :studyId", nativeQuery = true)
    void updateProjectPrivateStatusAndAgree(@Param("studyId") int studyId, @Param("isPrivate") String isPrivate, @Param("isAgree") String isAgree);
}
