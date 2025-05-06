package com.boot.tico.study.dto;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.PrePersist;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Table(name = "study_report_tb")
public class StudyReportDTO {
	
	@Column(name = "user_uuid")
	private String userUuid;
	
	@Id
	@Column(name = "report_id")
	private int reportId;
	
	@Column(name = "study_id")
	private int studyId;
	
	@Column(name = "reason")
	private String reason;
	
	@Column(name = "created_at", updatable = false)
    private Timestamp createdAt;
	
	@PrePersist
	protected void onCreate() {
		Timestamp now = new Timestamp(System.currentTimeMillis());
		this.createdAt = now;
	}
}
