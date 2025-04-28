package com.boot.tico.search.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.boot.tico.search.dto.SearchPageDTO;

@Repository
public interface SearchRepository extends JpaRepository<SearchPageDTO, Integer>{
	@Query(value = "SELECT * FROM page_tb WHERE page_name LIKE %:keyword%", nativeQuery = true)
    List<SearchPageDTO> searchPages(@Param("keyword") String keyword);
}
