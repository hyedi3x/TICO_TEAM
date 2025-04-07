package com.boot.tico.quiz.dao;

import org.apache.ibatis.annotations.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.boot.tico.quiz.dto.SolvedDTO;

@Repository
public interface SolvedRepository extends JpaRepository<SolvedDTO, Integer> {
	
	@Query(value = "SELECT * FROM user_solved_tb WHERE user_uuid = :uuid AND quiz_id = :quizId", nativeQuery = true)
    SolvedDTO findByUserUuidAndQuizId(@Param("uuid") String uuid, @Param("quizId") int quizId);

}
