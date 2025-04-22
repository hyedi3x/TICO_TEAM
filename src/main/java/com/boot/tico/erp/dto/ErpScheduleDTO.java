package com.boot.tico.erp.dto;

import lombok.*;

import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

@Entity
@Table(name = "erp_schedule")
public class ErpScheduleDTO {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)	// 기본 키 자동 증가
    @Column(name = "erp_schedule_id")
    private Long erpScheduleId;

    @Column(name = "erp_schedule_title", nullable = false)
    private String erpScheduleTitle;

    @Column(name = "erp_schedule_content")
    private String erpScheduleContent;

    // @JsonFormat : json 라이브러리 애너테이션. 날짜/시간 타입을 json으로 직렬화하거다 역직렬화 할 때 형식을 지정해줌.
    // pattern 날짜 출력 형식 지정 / timezone 시간대 지정
    // 서버-클라이언트 간 날짜 형식 통일을 위해 설정
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss", timezone = "Asia/Seoul")		// LocalDateTime을 JSON으로 변환할 때 포맷을 지정.
    @Column(name = "erp_schedule_start", nullable = false)
    private LocalDateTime erpScheduleStart;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss", timezone = "Asia/Seoul")
    @Column(name = "erp_schedule_end", nullable = false)
    private LocalDateTime erpScheduleEnd;
    
    @Column(name = "erp_schedule_color")
    private String erpScheduleColor;

    @Column(name = "emp_id", nullable = false)
    private String empId; // 사원 ID 직접 저장 (FK)

    @Column(name = "erp_schedule_created_at", updatable = false)	// update쿼리에서 제외시킴. 한 번 값이 들어가면, 수정은 안됨.
    private LocalDateTime erpScheduleCreateAt;

    @Column(name = "erp_schedule_updated_at")
    private LocalDateTime erpScheduleUpdatedAt;
}