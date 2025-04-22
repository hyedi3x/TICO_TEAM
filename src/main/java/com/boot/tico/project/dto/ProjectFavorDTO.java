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

@Entity
@Table(name = "project_favor_tb")
@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectFavorDTO {

	@Id
	@Column(name = "favor_id")
	private int favorId;
	
	@Column(name = "project_id")
	private int projectId;
	
	@Column(name="user_uuid")
    private String userUuid;
	
	@Column(name = "favor_type")
	private String favorType;
	
	@Column(name = "favor_time")
	private Timestamp favorTime;
	
	@PrePersist
	protected void onCreate() {
		Timestamp now = new Timestamp(System.currentTimeMillis());
		this.favorTime = now;
	}
}
