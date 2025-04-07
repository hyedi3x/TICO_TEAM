package com.boot.tico.quiz.service;

import java.util.List;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.boot.tico.quiz.dao.QuizRepository;
import com.boot.tico.quiz.dao.SolvedRepository;
import com.boot.tico.quiz.dto.QuizDTO;
import com.boot.tico.quiz.dto.SolvedDTO;

@Service
public class QuizService {
	
	@Autowired
	private QuizRepository quizRepo;
	
	@Autowired
	private SolvedRepository solvRepo;
	
	// 목록 조회
	@Transactional
	public List<QuizDTO> findAllQuiz(){
		return quizRepo.findAll();
	}
	// 목록 조회
	@Transactional
	public List<SolvedDTO> findAllSolved(){
		return solvRepo.findAll();
	}
}
