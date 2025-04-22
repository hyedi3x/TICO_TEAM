package com.boot.tico.project.dto;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.PrePersist;
import javax.persistence.Table;
import javax.persistence.Transient;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "project_comment_tb")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ProjectCommentDTO {
	@Id
	@Column(name = "comment_id")
	private int commentId; 
	
	@Column(name = "project_id")
	private int projectId;
	
	@Column(name="user_uuid")
	private String userUuid;
	
	@Column(name="comment_text")
	private String commentText;
	
	@Column(name = "created_at")
	private Timestamp createdAt;
	
	@Transient
	private String nickname;
	
	@PrePersist
	protected void onCreate() {
		Timestamp now = new Timestamp(System.currentTimeMillis());
        this.createdAt = now;
	}
}
