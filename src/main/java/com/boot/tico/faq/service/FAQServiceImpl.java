package com.boot.tico.faq.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.boot.tico.faq.dao.FAQRepository;
import com.boot.tico.faq.dto.FAQDTO;

@Service
public class FAQServiceImpl {
	
	@Autowired
	private FAQRepository repo;
	
	// 등록
	@Transactional  // 작업의 단위, 메서드 정상 종료시 트랜젝션이 DB로 커밋, 예외 발생시 롤백
	public FAQDTO save(FAQDTO dto) {
		Optional<FAQDTO> existing = repo.findByQuestion(dto.getQuestion()); //SELECT * FROM faq_tb WHERE question = dto.getQuestion;
		// optional은 null일 수도 있는 값을 감싸는 Wrapper, isPresent()로 값 존재 여부 확인, get()으로 내부 값 꺼냄
	    if (existing.isPresent()) { // 동일한 값이 조회된다면? (null이 아니면 true를 반환)
	        // 이미 존재하면 answer만 업데이트
	        FAQDTO existingFaq = existing.get(); //  DB에서 가져온 기존 FAQ 엔티티 객체
	        existingFaq.setAnswer(dto.getAnswer()); //FAQDTO 클래스에 있는 Setter 메서드
	        return repo.save(existingFaq); // 답변만 바꿔서 저장
	    } else {
	    	
	    	// qa_id의 최대값을 조회하여 다음 qa_id 값을 계산
            Integer maxQaId = repo.findMaxQaId(); // 최대 qa_id 값을 조회하는 메서드
            // 만약 maxQaId가 null이면 1부터 시작
            int newQaId = (maxQaId == null) ? 1 : maxQaId + 1;
            // 새로운 FAQDTO 객체에 qa_id를 설정
            dto.setQa_id(newQaId);
	        // 없으면 새로 저장
	        return repo.save(dto);
	    }
	}
	// 조회
	@Transactional 
	public List<FAQDTO> findAll() {
		return repo.findAll();
		
		
	}
	// 삭제
	@Transactional  // 작업의 단위, 메서드 정상 종료시 트랜젝션이 DB로 커밋, 예외 발생시 롤백
	public String delete(int faq_id) {
		System.out.println(faq_id+"아이디");
		repo.deleteById(faq_id);
		return "ok";

	}
	// 1건 조회
	@Transactional  // 작업의 단위, 메서드 정상 종료시 트랜젝션이 DB로 커밋, 예외 발생시 롤백
	public FAQDTO findById(int faq_id) {
		FAQDTO DTO = repo.findById(faq_id)
		.orElseThrow(() -> new IllegalArgumentException("조회 오류")); 
		//-> 는 람다식 (IllegalArgumentException 예외 객체를 생성하여 예외 발생, 오류메시지 출력)
		return DTO;
		
	}
	
	// 수정
	@Transactional  // 작업의 단위, 메서드 정상 종료시 트랜젝션이 DB로 커밋, 예외 발생시 롤백
	public FAQDTO put(int qa_id, FAQDTO DTO) {
		
		FAQDTO DTOp = repo.findById(qa_id)
				.orElseThrow(() -> new IllegalArgumentException("수정 오류")); //-> 는 람다식 (IllegalArgumentException 예외 객체를 생성하여 예외 발생, 오류메시지 출력)
			// 엔티티의 값을 변경하면 자동으로 데이터베이스(DB)도 변경
		DTOp.setAnswer(DTO.getAnswer());
		DTOp.setQuestion(DTO.getQuestion());
		DTOp.setModify_email(DTO.getModify_email());
		return DTOp;
	}
}
