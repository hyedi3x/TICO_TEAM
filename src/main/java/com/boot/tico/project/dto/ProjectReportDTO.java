package com.boot.tico.project.dto;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.PrePersist;
import javax.persistence.Table;

import com.boot.tico.login.entity.User;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

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
	
	@ManyToOne(fetch = FetchType.LAZY)	// ManyToOne : 다대일 관계를 설정. fetch = FetchType.LAZY : 연관된 엔티티(User)를 지연 로딩. 즉, report.getUser()를 호출하기 전까지는 DB에서 User 정보를 가져오지 않음 → 성능 최적화에 좋음
	@JoinColumn(name = "user_uuid", insertable = false, updatable = false)	// user_uuid 필드가 이미 DTO에 존재하기 때문에, 연관관계용 필드는 읽기 전용으로 설정
	@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})	// 
	private User user;
	
	@Column(name = "user_uuid")
	private String userUuid;
	
	@Id
	@Column(name = "report_id")
	private int reportId;
	
	@Column(name = "project_id")
	private int projectId;
	
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
