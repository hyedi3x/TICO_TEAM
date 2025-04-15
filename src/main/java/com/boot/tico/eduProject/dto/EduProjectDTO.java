package com.boot.tico.eduProject.dto;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.PrePersist;
import javax.persistence.Table;

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
public class EduProjectDTO {
	
	@Id
    private int quiz_id;
    private String quiz_title;
	private String quiz_description;
	private String quiz_level;
	private String answer_xml;
	private String quiz_img;
	private String answer_img;
	private String isdelete;
	private String emp_id;
	
	@PrePersist // JPA에서 엔티티가 DB에 저장되기 전, INSERT 되기 직전에 실행되는 콜백 메서드
    public void prePersist() {
        if (this.isdelete == null) {
            this.isdelete = "N";  // null이면 직접 채워줌
        }
    }
}
