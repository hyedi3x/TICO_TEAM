package com.boot.tico.quiz.dto;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import org.springframework.beans.factory.annotation.Autowired;

import com.boot.tico.quiz.dao.QuizRepository;

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
@Table(name = "user_solved_tb")
public class SolvedDTO {
	
	@Id
	private int id;                   // 풀이 기록 고유 ID
    private String userUuid;         // 사용자 UUID
    private int quizId;              // 문제 ID
    private int solvedCount;         // 푼 횟수
    private String solvedAt;
}
