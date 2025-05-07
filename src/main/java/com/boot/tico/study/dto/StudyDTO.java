package com.boot.tico.study.dto;

import lombok.*;
import javax.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "study_tb")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class StudyDTO {

    @Id
    @Column(name = "study_id")
    private Integer studyId;

    @Column(name = "project_id", nullable = false)
    private Integer projectId;

    @Column(name = "user_uuid", nullable = false)
    private String userUuid;

    private String title;
    private String category;

    @Column(columnDefinition = "LONGTEXT")
    private String introduction;

    @Column(columnDefinition = "TEXT")
    private String goal;

    private String difficulty;
    private String duration;

    private String isprivate;
    private String isagree;
    private String isdelete;
    private String iscomment;
    private Integer number;

    @Column(name = "created_at", updatable = false)
    private Timestamp createdAt;

    @Column(name = "updated_at")
    private Timestamp updatedAt;
    
    private String isadded;

    @Transient
    private String nickname;
    
    @Transient
    private String thumbnailUrl;

    @PrePersist
    protected void onCreate() {
        Timestamp now = new Timestamp(System.currentTimeMillis());
        this.createdAt = now;
        this.updatedAt = now;

        if (this.isprivate == null) this.isprivate = "Y";
        if (this.isagree == null) this.isagree = "N";
        if (this.isdelete == null) this.isdelete = "N";
        if (this.iscomment == null) this.iscomment = "Y";
        if (this.isadded == null) this.isadded = "N";
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = new Timestamp(System.currentTimeMillis());

        if (this.isprivate == null) this.isprivate = "Y";
        if (this.isagree == null) this.isagree = "N";
        if (this.isdelete == null) this.isdelete = "N";
        if (this.iscomment == null) this.iscomment = "Y";
        if (this.isadded == null) this.isadded = "N";
    }
}
