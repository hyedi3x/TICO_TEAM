package com.boot.tico.erp.repo;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.boot.tico.erp.dto.ErpNotiDTO;

@Repository
public interface ErpNotiRepository extends JpaRepository<ErpNotiDTO, Long> {	
	// ErpNotiDTO 엔티티에 대한 데이터베이스 작업 처리하는 인터페이스
	// JpaRepository<ErpNotiDTO, Long>를 확장

	// 커스텀 쿼리 메서드
	// JPQL(Java Persistence Query Language):Java에서 객체지향적으로 데이터베이스와 상호작용하기 위해 사용하는 쿼리 언어. 엔티티(Java 객체)와 속성(Java 객체의 필드)을 대상으로 함./SQL은 테이블과 컬럼을 대상으로
    // 페이징 포함 키워드, 검색타입, 유형(카테고리) 조건으로 공지사항 검색 / searchType에 따라 title, content, titleAndContent로 검색할 수 있음.
	@Query("SELECT e FROM ErpNotiDTO e WHERE " +
	        "(:searchType IS NULL OR " +
	        "(:searchType = 'title' AND e.erpNotiTitle LIKE %:keyword%) OR " +
	        "(:searchType = 'content' AND e.erpNotiContent LIKE %:keyword%) OR " +
	        "(:searchType = 'titleAndContent' AND (e.erpNotiTitle LIKE %:keyword% OR e.erpNotiContent LIKE %:keyword%))) " +
	        "AND (:category IS NULL OR e.erpNotiType = :category) " +
	        "AND (:status IS NULL OR e.erpNotiStatus = :status)" +
			"AND (:empId IS NULL OR e.empId = :empId)") 
	Page<ErpNotiDTO> findByKeywordPaging(
	        @Param("keyword") String keyword,
	        @Param("searchType") String searchType,
	        @Param("category") String category,
	        @Param("status") String status,
	        @Param("empId") String empId,
	        Pageable pageable);	// 검색 조건에 맞는 공지사항을 페이징 처리하여 반환. 페이징은 Pageable 객체로 처리. 반환 타입은 Page<ErpNotiDTO>

	
	// 만료일이 지난 공지사항 중 아직 활성 상태인 항목 조회 (자동 비활성화용)
    List<ErpNotiDTO> findByErpNotiExpiredAtBeforeAndErpNotiStatus(LocalDate today, String status);	// LocalDate 오늘 날짜. 만료일과 비교.
    
    // 최근 공지사항 5개
    List<ErpNotiDTO> findAllByOrderByErpNotiCreatedAtDesc(Pageable pageable);	// findAllBy: ErpNotiDTO 엔티티에 대한 모든 데이터 조회하는 메서드
    
    // 내일 만료돌 공지사항 조회
    List<ErpNotiDTO> findByErpNotiExpiredAt(LocalDate expiredAt);
}
