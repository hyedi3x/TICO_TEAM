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
	// 상세조회 (퀴즈 정답용)
	public QuizDTO findByQuizId(int quiz_id){
		return quizRepo.findById(quiz_id)
				.orElseThrow(() -> new IllegalArgumentException("조회 오류")); 
	}
	// 업데이트
	public String solvedQuizPut(SolvedDTO dto) {
		int quiz_id = dto.getQuiz_id();
		String user_uuid = dto.getUser_uuid();
		
		SolvedDTO existing = solvRepo.findByUserUuidAndQuizId(user_uuid, quiz_id);
		int maxId = solvRepo.selectMaxId();
		
		if(existing != null) {
			solvRepo.updateSolvedCount(user_uuid, quiz_id);
			return "수정";
		} else {
			solvRepo.insertSolvedRecord(maxId, user_uuid, quiz_id);
			return "등록";
		}
		
	}
}
