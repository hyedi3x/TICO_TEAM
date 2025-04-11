package com.boot.tico.project.dto;

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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "project_object_tb")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectObjectDTO {

	@Id
    @Column(name = "object_id")
	private Integer objectId;

    @Column(name = "project_id")
    private Integer projectId;

    @Column(name = "object_index")
    private Integer objectIndex;

    private String url;
    private double x;
    private double y;
    private double width;
    private double height;
    private double angle;
    
    @Column(name= "move_direction")
    private double moveDirection;

    private Boolean hidden;
    private double hue;
    private double brightness;
    private double opacity;

    @Column(name = "flip_x")
    private Integer flipX;

    @Column(name = "flip_y")
    private Integer flipY;

    @Column(name = "bubble_text", columnDefinition = "TEXT")
    private String bubbleText;

    @Column(name = "block_xml", columnDefinition = "LONGTEXT")
    private String blockXml;

    @Column(name = "created_at", updatable = false)
    private Timestamp createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = new Timestamp(System.currentTimeMillis());
    }
}
