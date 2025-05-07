package com.boot.tico.eduProject.service;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.boot.tico.eduProject.dao.EduProjectRepository;
import com.boot.tico.eduProject.dto.EduProjectDTO;

@Service
public class EduProjectService {
	
	@Autowired
	private EduProjectRepository repo;
	
	@Transactional  // 작업의 단위, 메서드 정상 종료시 트랜젝션이 DB로 커밋, 예외 발생시 롤백
	public EduProjectDTO save(EduProjectDTO dto) {
		//Optional<EduProjectDTO> existing = repo.findByQuiz_title(dto.getQuiz_title()); //SELECT * FROM faq_tb WHERE question = dto.getQuestion;
		Optional<EduProjectDTO> existing = repo.findById(dto.getQuiz_id());
		// optional은 null일 수도 있는 값을 감싸는 Wrapper, isPresent()로 값 존재 여부 확인, get()으로 내부 값 꺼냄
	    if (existing.isPresent()) { // 동일한 값이 조회된다면? (null이 아니면 true를 반환)
	        // 이미 존재하면 answer만 업데이트
	    	EduProjectDTO existingEdu = existing.get(); //  DB에서 가져온 기존 FAQ 엔티티 객체
	    	existingEdu.setQuiz_title(dto.getQuiz_title());
	    	existingEdu.setQuiz_description(dto.getQuiz_description()); 
	    	existingEdu.setQuiz_level(dto.getQuiz_level()); 
	    	existingEdu.setAnswer_xml(dto.getAnswer_xml());
	    	existingEdu.setAnswer_img(dto.getAnswer_img()); 
	    	existingEdu.setQuiz_img(dto.getQuiz_img()); 
	        return repo.save(existingEdu); // 답변만 바꿔서 저장
	    } else {
	        // 없으면 새로 저장
	    	int nextQuiz_id = repo.getLatestQuizId();
	        dto.setQuiz_id(nextQuiz_id); // DTO에 quiz_id 설정
	        return repo.save(dto);
	    }
	}
	
	@Transactional
	public String manageQuiz(int quiz_id, String action) {
		System.out.println("id"+ quiz_id + "action: "+ action);
		EduProjectDTO dto = repo.findById(quiz_id).orElseThrow(); 
		// orElseThrow() : Optional에 값이 있으면 그 값을 반환, 없으면 예외를 던짐
		
		switch (action) {
        case "restore":
            dto.setIsdelete("N");
            repo.save(dto);
            return "삭제취소 완료";
        case "delete":
            dto.setIsdelete("Y");
            repo.save(dto);
            return "임시 삭제 완료";
        case "hardDelete":
            repo.deleteById(quiz_id);
            return "영구 삭제 완료";
        default:
        	return "manageQuiz 처리 오류";
		}
	}
}
