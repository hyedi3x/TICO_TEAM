package com.boot.tico.eduProject.dao;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.boot.tico.eduProject.dto.EduProjectDTO;

@Repository
public interface EduProjectRepository  extends JpaRepository<EduProjectDTO, Integer>{
	
	@Query(value = "SELECT NVL(MAX(quiz_id)+1, 1) FROM quiz_tb", nativeQuery = true)
	int getLatestQuizId();
	
	@Query(value = "SELECT * FROM quiz_tb WHERE quiz_title = :quiz_title", nativeQuery = true)
    Optional<EduProjectDTO> findByQuiz_title(String quiz_title);
	
}
