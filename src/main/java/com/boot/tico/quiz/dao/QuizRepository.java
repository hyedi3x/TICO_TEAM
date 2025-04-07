package com.boot.tico.quiz.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.boot.tico.quiz.dto.QuizDTO;

@Repository
public interface QuizRepository extends JpaRepository<QuizDTO, Integer> {

}
