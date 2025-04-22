package com.boot.tico.quiz.dao;

import javax.transaction.Transactional;

import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.boot.tico.quiz.dto.SolvedDTO;

@Repository
public interface SolvedRepository extends JpaRepository<SolvedDTO, Integer> {
	
	@Transactional
	@Query(value = "SELECT * FROM user_solved_tb "
			+ "WHERE user_uuid = :user_uuid AND quiz_id = :quiz_id", nativeQuery = true)
    SolvedDTO findByUserUuidAndQuizId(@Param("user_uuid") String user_uuid, @Param("quiz_id") int quiz_id);
	
	@Transactional
	@Query(value="SELECT COALESCE(MAX(id)+1,1)FROM user_solved_tb", nativeQuery = true)
	int selectMaxId();
	
	@Modifying
	@Transactional
	@Query(value = "UPDATE user_solved_tb "
			+ "SET solved_count = solved_count+1, solved_at = CURRENT_TIMESTAMP "
			+ "WHERE quiz_id = :quiz_id AND user_uuid= :user_uuid", nativeQuery = true)
	int updateSolvedCount(@Param("user_uuid") String user_uuid, @Param("quiz_id")int quiz_id);
	
	@Modifying
	@Transactional
	@Query(value="INSERT INTO user_solved_tb (id, user_uuid, quiz_id, solved_count) "
			+ "VALUES (:id, :user_uuid, :quiz_id, 1)", nativeQuery = true)
	int insertSolvedRecord(@Param("id") int id, @Param("user_uuid") String user_uuid, @Param("quiz_id") int quiz_id);
	
}
