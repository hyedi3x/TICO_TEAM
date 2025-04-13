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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "erp_schedule_id")
    private Long erpScheduleId;

    @Column(name = "erp_schedule_title", nullable = false)
    private String erpScheduleTitle;

    @Column(name = "erp_schedule_content")
    private String erpScheduleContent;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss", timezone = "Asia/Seoul")
    @Column(name = "erp_schedule_start", nullable = false)
    private LocalDateTime erpScheduleStart;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss", timezone = "Asia/Seoul")
    @Column(name = "erp_schedule_end", nullable = false)
    private LocalDateTime erpScheduleEnd;
    
    @Column(name = "erp_schedule_color")
    private String erpScheduleColor;

    @Column(name = "emp_id", nullable = false)
    private String empId; // 사원 ID 직접 저장 (FK)

    @Column(name = "erp_schedule_created_at", updatable = false)
    private LocalDateTime erpScheduleCreateAt;

    @Column(name = "erp_schedule_updated_at")
    private LocalDateTime erpScheduleUpdatedAt;
}