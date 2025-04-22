package com.boot.tico.blocklyObject.dto;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.PrePersist;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// Lombok 어노테이션
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder

// JPA Entity로 선언 (DB테이블과 매핑)
@Entity
@Table(name = "blockly_object")		// 테이블명 지정
public class BlocklyObject {
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "blockly_object_id")
    private Long blocklyObjectId;

	@Column(name = "blockly_object_name")
    private String blocklyObjectName;

	@Column(name = "blockly_object_category")
    private String blocklyObjectCategory;

	// 오브젝트 이미지 파일 경로 (상대경로로 저장)
	@Column(name = "blockly_object_file_path")
    private String blocklyObjectFilePath;

	// 오브젝트 설명 (길이가 길 수 있어 TEXT 타입 사용)
    @Column(name = "blockly_object_description", columnDefinition = "TEXT")
    private String blocklyObjectDescription;

    @Column(name = "blockly_object_width")
    private Integer blocklyObjectWidth;

    @Column(name = "blockly_object_height")
    private Integer blocklyObjectHeight;
    
    // 등록한 관리자(사원) ID
    private String empId;

    // 포인트 사용 여부 (true면 유료 오브젝트)
    @Column(name = "blockly_object_point")
    private Boolean blocklyObjectPoint;

    @Column(name = "blockly_object_created_at")
    private Timestamp blocklyObjectCreatedAt;
    
    // 저장(Persist) 직전에 자동으로 기본값을 설정하는 메서드
    @PrePersist
    public void setDefaultValues() {
        if (blocklyObjectWidth == null) {
            blocklyObjectWidth = 50;
        }
        if (blocklyObjectHeight == null) {
            blocklyObjectHeight = 50;
        }
        if (blocklyObjectPoint == null) {
            blocklyObjectPoint = false;
        }
        if (blocklyObjectCreatedAt == null) {
            blocklyObjectCreatedAt = new Timestamp(System.currentTimeMillis());
        }
    }
}
