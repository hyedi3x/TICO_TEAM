package com.boot.tico.quiz.dto;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import com.boot.tico.faq.dto.FAQDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data					// @Getter + @Setter
@AllArgsConstructor		// 매개변수 생성자
@NoArgsConstructor		// 디폴트 생성자
@ToString
@Builder				// 매개변수 생성자에 순서없이 값을 입력해서 세팅해도 마지막에 build()를 통해 빌더를 작동, 같은 타입의 다른 변수의 값을 서로 순서 바꿔넣어도 인식한다는 말인듯?
@Entity   				// ORM(table의 컬럼과 object의 멤버변수를 매핑)
@Table(name = "quiz_tb")
public class QuizDTO {
	
	@Id
	private int quiz_id;
    private String quiz_title;
	private String quiz_description;
	private String quiz_level;
	private String answer_xml;
	private String quiz_img;
	private String answer_img;
	
	
}
