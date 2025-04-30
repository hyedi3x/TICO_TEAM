package com.boot.tico.notice.dto;

import java.sql.Timestamp;
import java.time.Instant;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.PrePersist;
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
@Table(name = "notice_tb")
public class NoticeDTO {
	
// 데이터베이스 컬럼이 NULL 이 될 수 있기 때문에 DTO도 그 상태를 담으려면 null 을 표현할 수 있어야 해서 int보다 integer가 적합
	@Id
	@Column(name = "notice_id")
	private Integer noticeId;      // PK
	@Column(name = "title")
	private String  title;
	@Column(name = "content")
	private String content; 
	@Column(name = "emp_id")
	private String  empId;         // 작성 직원 ID (FK)
	@Column(name = "type")
	private String  type;  // 기본값
	@Column(name = "modify_id")
	private String modifyId;
	@Column(name = "likes_length")
	private Integer likesLength;
	@Column(name = "visit_length")
	private Integer visitLength;
	@Column(name = "created_at")
	private Timestamp createdAt;
	@Column(name = "show_flag")
	private String showFlag;
	
	// insert 전에 실행되는 메서드
	@PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = Timestamp.from(Instant.now());
        }
        if (this.showFlag == null) {
            this.showFlag = "Y";
        }
    }
	
}
