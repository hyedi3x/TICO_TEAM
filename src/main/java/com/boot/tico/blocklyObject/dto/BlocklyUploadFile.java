package com.boot.tico.blocklyObject.dto;

import java.time.LocalDateTime;

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

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "blockly_upload_file")
public class BlocklyUploadFile {
	 	@Id
	 	@Column(name = "file_id", length = 50)
	    private String fileId;		// file_id = 저장된 파일명과 동일

	 	@Column(name = "original_filename")
	    private String originalFilename;

	 	@Column(name = "stored_filename")
	    private String storedFilename;

	 	@Column(name = "file_path")
	    private String filePath;	// 상대경로만 지정

	 	@Column(name = "file_size")
	    private Long fileSize;

	 	@Column(name = "file_type")
	    private String fileType;

	 	@Column(name = "upload_time")
	    private LocalDateTime uploadTime;

	 	@Column(name = "user_uuid")
	    private String userUuid;

	    @PrePersist
	    public void prePersist() {
	        this.uploadTime = LocalDateTime.now();
	    }
}
