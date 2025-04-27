package com.boot.tico.project.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.boot.tico.project.dto.ProjectDTO;

@Repository
public interface ProjectRepository extends JpaRepository<ProjectDTO, Integer>{
	
	/**
     * [1] 가장 마지막 프로젝트 ID 반환
     * - 가장 큰 project_id 값을 반환하고, 없으면 0을 반환
     */
	@Query(value = "SELECT IFNULL(MAX(project_id), 0) FROM project_tb", nativeQuery = true)
	int getLatestProjectId();
	
	/**
     * [2] 사용자가 만든 작품 수를 계산
     * - 특정 사용자가 만든 삭제되지 않은 작품 수를 반환
     */
	@Query(value = "SELECT COUNT(*) FROM project_tb WHERE user_uuid = :userUuid AND isdelete = 'N'", nativeQuery = true)
	int countByUserUuid(@Param("userUuid") String userUuid);
	
	/**
     * [3] 삭제되지 않은 전체 프로젝트 목록 조회
     * - 삭제되지 않은 프로젝트 목록을 조회
     */
	@Query(value = "SELECT * FROM project_tb WHERE isdelete = 'N' ORDER BY project_id", nativeQuery = true)
	List<ProjectDTO> findByIsDelete(); // "N"이면 살아있는 것만
	
	/**
     * [4] 특정 유저의 삭제되지 않은 프로젝트 목록 조회
     * - 특정 유저의 삭제되지 않은 프로젝트 목록을 조회
     */
	@Query(value = "SELECT * FROM project_tb WHERE user_uuid = :userUuid AND isdelete = 'N' ORDER BY project_id", nativeQuery = true)
	List<ProjectDTO> findByUserUuid(String userUuid);
	
	/**
     * [5] 공개된 프로젝트 목록 조회
     * - 공개된 프로젝트 목록을 조회 (isPrivate = 'N' AND isDelete = 'N')
     */
	@Query(value="SELECT * FROM project_tb WHERE isPrivate = 'N' AND isDelete = 'N'", nativeQuery=true)
	List<ProjectDTO> findByIsPrivate();
	
	/**
     * [6] 프로젝트 공유 처리
     * - 프로젝트의 카테고리, 태그, 소개글, 가이드, 참고사항, 동의 여부 업데이트
     */
	@Modifying
    @Transactional
    @Query("UPDATE ProjectDTO p SET " +
            "p.category = :category, " +
            "p.tags = :tags, " +
            "p.introduction = :intro, " +
            "p.guide = :guide, " +
            "p.notes = :notes, " +
            "p.isAgree = :agree, " +
            "p.isPrivate = :priv " +
            "WHERE p.projectId = :projectId")
    void updateShareInfo(
        @Param("projectId") int projectId,
        @Param("category") String category,
        @Param("tags") String tags,
        @Param("intro") String intro,
        @Param("guide") String guide,
        @Param("notes") String notes,
        @Param("agree") String agree,
        @Param("priv") String priv
    );
	
	/**
	 * [7] 삭제 후 존재하는 작품들 번호 재배치
	 */
	@Query(value = "SELECT * FROM project_tb WHERE user_uuid = :userUuid AND isdelete = 'N' ORDER BY created_at", nativeQuery = true)
	List<ProjectDTO> findByUserUuidAndIsDelete(@Param("userUuid") String userUuid);
	
	/**
	 * [8] 작품 상세페이지 작품 공개/비공개 상태 변경
	 */
	@Modifying
	@Transactional
	@Query(value = "UPDATE project_tb SET isprivate = :isPrivate, isagree = :isAgree WHERE project_id = :projectId", nativeQuery = true)
	void updateProjectPrivateStatusAndAgree(@Param("projectId") int projectId, @Param("isPrivate") String isPrivate, @Param("isAgree") String isAgree);

	/**
	 * [9] 작품 상세페이지 댓글 허용/비허용 상태 변경
	 */
	@Modifying
	@Transactional
	@Query(value = "UPDATE project_tb SET iscomment = :isComment WHERE project_id = :projectId", nativeQuery = true)
	void updateProjectCommentStatus(@Param("projectId") int projectId, @Param("isComment") String isComment);
	
	@Query(value = "SELECT * FROM project_tb WHERE isprivate = 'N' AND (title LIKE %:keyword% OR introduction LIKE %:keyword%)", nativeQuery = true)
	List<ProjectDTO> searchProjects(@Param("keyword") String keyword);
	
	// 조회수 업데이트
	@Modifying
	@Transactional
	@Query(value = "UPDATE project_tb SET view_count = view_count + 1 WHERE project_id = :projectId", nativeQuery = true)
	void incrementViewCount(@Param("projectId") int projectId);
	
	// 댓글 개수 업데이트
	@Modifying
	@Transactional
	@Query(value = """
	    UPDATE project_tb
	    SET comment_count = (
	        SELECT COUNT(*) FROM project_comment_tb
	        WHERE project_id = :projectId
	    )
	    WHERE project_id = :projectId
	""", nativeQuery = true)
	void updateCommentCount(@Param("projectId") int projectId);
	
	// 좋아요 개수 업데이트
	@Modifying
	@Transactional
	@Query(value = """
	    UPDATE project_tb 
	    SET like_count = (
	        SELECT COUNT(*) 
	        FROM project_favor_tb 
	        WHERE project_id = :projectId AND favor_type = 'like'
	    )
	    WHERE project_id = :projectId
	""", nativeQuery = true)
	void updateLikeCount(@Param("projectId") int projectId);


	// 북마크 개수 업데이트
	@Modifying
	@Transactional
	@Query(value = """
	    UPDATE project_tb 
	    SET bookmark_count = (
	        SELECT COUNT(*) 
	        FROM project_favor_tb 
	        WHERE project_id = :projectId AND favor_type = 'bookmark'
	    )
	    WHERE project_id = :projectId
	""", nativeQuery = true)
	void updateBookmarkCount(@Param("projectId") int projectId);
	
	// 메인화면 인기 작품 조회, 좋아요, 북마크, 조회수 많은 순서로 정렬
	@Query(value = "SELECT * FROM project_tb " +
            "WHERE isprivate = 'N' AND isdelete = 'N' " +
            "ORDER BY like_count DESC, bookmark_count DESC, view_count DESC",
    nativeQuery = true)
	List<ProjectDTO> findPopularProjects();
	
}
