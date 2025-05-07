package com.boot.tico.study.dto;

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
@Table(name = "study_comment_tb")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class StudyCommentDTO {
	
	@Id
	@Column(name = "comment_id")
	private int commentId;
	
	@Column(name = "study_id")
    private int studyId;
	
	@Column(name="user_uuid")
    private String userUuid;
	
	@Column(name="comment_text")
	private String commentText;
	
	@Column(name = "created_at")
	private Timestamp createdAt;
	
	@Transient
	private String nickname;

	@Transient
	private String title;
	
	@PrePersist
	protected void onCreate() {
		Timestamp now = new Timestamp(System.currentTimeMillis());
        this.createdAt = now;
	}
}
