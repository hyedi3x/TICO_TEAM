package com.boot.tico.blocklyObject.dto;

import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "blockly_draw")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlocklyDraw {

    @Id
    @Column(name = "draw_id", length = 50)
    private String drawId;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    @Column(name = "original_name")
    private String originalName;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "user_uuid", nullable = false, length = 36)
    private String userUuid;
}