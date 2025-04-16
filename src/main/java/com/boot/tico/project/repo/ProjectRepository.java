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
     * [1] 가장 마지막 프로젝트 ID 반환 (project_id 기준, 없으면 0 반환)
     */
	@Query(value = "SELECT IFNULL(MAX(project_id), 0) FROM project_tb", nativeQuery = true)
	int getLatestProjectId();
	
	/**
     * [2] 삭제되지 않은 전체 프로젝트 목록 조회
     */
	@Query(value = "SELECT * FROM project_tb WHERE isdelete = 'N' ORDER BY project_id", nativeQuery = true)
	List<ProjectDTO> findByIsDelete(); // "N"이면 살아있는 것만
	
	/**
     * [3] 특정 유저의 삭제되지 않은 프로젝트 목록 조회
     */
	@Query(value = "SELECT * FROM project_tb WHERE user_uuid = :userUuid AND isdelete = 'N' ORDER BY project_id", nativeQuery = true)
	List<ProjectDTO> findByUserUuid(String userUuid);
	
	/**
     * [4] 공개된 프로젝트 목록 조회 (isPrivate = 'N' AND isDelete = 'N')
     */
	@Query(value="SELECT * FROM project_tb WHERE isPrivate = 'N' AND isDelete = 'N'", nativeQuery=true)
	List<ProjectDTO> findByIsPrivate();
	
	/**
     * [5] 프로젝트 공유 처리
     * (공개 설정 + 태그/카테고리/소개글/가이드/참고사항 + 동의 여부 업데이트)
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

}
