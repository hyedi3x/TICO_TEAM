package com.boot.tico.project.dto;

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
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "project_report_tb")
public class ProjectReportDTO {

	@Id
	@Column(name = "report_id")
	private int reportId;
	
	@Column(name = "project_id")
	private int projectId;
	
	@Column(name = "user_uuid")
	private String userUuid;
	
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
