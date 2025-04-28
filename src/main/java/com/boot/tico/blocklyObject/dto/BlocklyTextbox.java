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

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "blockly_textbox")
public class BlocklyTextbox {

    @Id
    @Column(name = "textbox_id", length = 50)
    private String textboxId;

    @Column(name = "user_uuid", nullable = false, length = 36)
    private String userUuid;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String text;

    @Column(name = "font_size", nullable = false)
    private Integer fontSize = 24; // 기본값

    @Column(name = "color", length = 20)
    private String color = "#000000"; // 기본값

    @Column(name = "font_family", length = 100)
    private String fontFamily = "Arial"; // 기본값

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}