package com.boot.tico.project.dto;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.PrePersist;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "project_view_tb")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class ProjectViewDTO {

	@Id
	@Column
	private int viewId;
	
	@Column(name = "project_id")
    private int projectId;

    @Column(name = "user_uuid")
    private String userUuid;

    @Column(name = "viewed_at")
    private Timestamp viewedAt;
    
    @PrePersist
    protected void onCreate() {
    	Timestamp now = new Timestamp(System.currentTimeMillis());
    	this.viewedAt = now;
    }
}
