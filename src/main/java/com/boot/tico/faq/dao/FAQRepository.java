package com.boot.tico.faq.dao;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.boot.tico.faq.dto.FAQDTO;

@Repository
public interface FAQRepository extends JpaRepository<FAQDTO, Integer>{
									// JpaRepository<FAQDto, Integer>는 제네릭 인터페이스로, 두 개의 타입 매개변수를 받습니다.
									// FAQDto: 데이터베이스 테이블과 매핑되는 엔티티 클래스
									// Integer: FAQDto 엔티티의 기본 키(Primary Key)의 데이터 타입
	 Optional<FAQDTO> findByQuestion(String question); // By 뒤 컬럼명에 맞게 자동 쿼리 생성됨, SELECT * FROM faq_tb WHERE question = ?;
};
