package com.boot.tico.project.dto;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "staff_pick_tb")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ProjectStaffPickDTO {
	
	@Id
	@Column(name = "pick_id")
	private int pickId;
	@Column(name = "emp_id")
	private String userUuid;
	@Column(name = "slot_index")
	private int slotIndex;
	@Column(name = "project_id")
	private String projectId;
	//  JPA가 이 필드를 INSERT 시 SQL에 포함하지 않음, JPA가 UPDATE 시에도 이 필드를 무시함
	@Column(name = "created_at", insertable = false, updatable = false)
	private Timestamp createdAt;
	@Column(name="updated_at", insertable = false, updatable = false)
	private Timestamp updatedAt;
	    
}
