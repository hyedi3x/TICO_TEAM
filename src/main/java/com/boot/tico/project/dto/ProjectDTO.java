package com.boot.tico.project.dto;

import lombok.*;
import javax.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "project_tb")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ProjectDTO {

    @Id
    @Column(name = "project_id")
    private Integer projectId;
    
    @Column(name="user_uuid")
    private String userUuid;

    private String title;
    private String category;
    private String tags;

    @Column(name = "thumbnail_url", columnDefinition = "TEXT")
    private String thumbnailUrl;

    @Column(name = "isprivate")
    private String isPrivate;

    @Column(columnDefinition = "LONGTEXT")
    private String introduction;

    @Column(columnDefinition = "LONGTEXT")
    private String guide;
    
    @Column(columnDefinition = "LONGTEXT")
    private String notes;

    @Column(name = "isagree")
    private String isAgree;

    @Column(name = "isdelete")
    private String isDelete;

    @Column(name = "comment_count")
    private Integer commentCount;

    @Column(name = "view_count")
    private Integer viewCount;

    @Column(name = "like_count")
    private Integer likeCount;

    @Column(name = "bookmark_count")
    private Integer bookmarkCount;

    @Column(name = "created_at", updatable = false)
    private Timestamp createdAt;

    @Column(name = "updated_at")
    private Timestamp updatedAt;
    
    private Integer number;
    
    @Column(name = "iscomment")
    private String isComment;

    @PrePersist
    protected void onCreate() {
        Timestamp now = new Timestamp(System.currentTimeMillis());
        this.createdAt = now;
        this.updatedAt = now;
        
        if (this.isPrivate == null) this.isPrivate = "Y";
        if (this.isAgree == null) this.isAgree = "N";
        if (this.isDelete == null) this.isDelete = "N";
        if (this.isComment == null) this.isComment = "Y";
        if (this.commentCount == null) this.commentCount = 0;
        if (this.viewCount == null) this.viewCount = 0;
        if (this.likeCount == null) this.likeCount = 0;
        if (this.bookmarkCount == null) this.bookmarkCount = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = new Timestamp(System.currentTimeMillis());
        
        if (this.isPrivate == null) this.isPrivate = "Y";
        if (this.isAgree == null) this.isAgree = "N";
        if (this.isDelete == null) this.isDelete = "N";
        if (this.isComment == null) this.isComment = "Y";
        if (this.commentCount == null) this.commentCount = 0;
        if (this.viewCount == null) this.viewCount = 0;
        if (this.likeCount == null) this.likeCount = 0;
        if (this.bookmarkCount == null) this.bookmarkCount = 0;
    }
}
