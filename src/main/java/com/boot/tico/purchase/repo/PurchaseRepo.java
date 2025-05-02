package com.boot.tico.purchase.repo;

import org.apache.ibatis.annotations.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.boot.tico.purchase.dto.Purchase;

@Repository
public interface PurchaseRepo extends JpaRepository<Purchase, String>{
	/*
	 * SELECT p FROM Purchase p JOIN FETCH p.user u : Purchase 엔티티를 기준으로 User 엔티티와
	 * JOIN FETCH where 조건 : :keyword가 null이면 전체 검색./아니면 u.name(유저 이름)이 keyword를
	 * 포함하는 경우 p.active = true : 활성화된 이용권만 대상.
	 * 
	 * countQuery : value 쿼리로는 페이징이 안 되므로, 개수만 세는 별도 쿼리 필요.
	 * keyword로 이름 필터, Pageable로 페이지 번호/사이즈 받음
	 */	
	
	@Query(value = """
		    SELECT p FROM Purchase p 
		    JOIN FETCH p.user u 
		    WHERE (:keyword IS NULL OR 
				    LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
				    LOWER(u.nickname) LIKE LOWER(CONCAT('%', :keyword, '%')))
		""",
		countQuery = """
		    SELECT COUNT(p) FROM Purchase p 
		    JOIN p.user u 
		    WHERE (:keyword IS NULL OR 
				    LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
				    LOWER(u.nickname) LIKE LOWER(CONCAT('%', :keyword, '%')))
		""")
		Page<Purchase> findActiveWithUser(@Param("keyword") String keyword, Pageable pageable);
}
