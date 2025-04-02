package com.boot.tico.project.dto;

import java.sql.Timestamp;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "project_tb")
public class ProjectDTO {
	
	@Id
	private int project_id;
	private String title;
	private String category;
	private String tags;
	private String thumbnail_url;
	private String isprivate;
	private String introduction;
	private String guide;
	private String notes;
	private String isagree;
	private String isdelete;
	private int comment_count;
	private int view_count;
	private int like_count;
	private int bookmark_count;
	private Timestamp created_at;
	private Timestamp updated_at;
	public int getProject_id() {
		return project_id;
	}
	public void setProject_id(int project_id) {
		this.project_id = project_id;
	}
	public String getTitle() {
		return title;
	}
	public void setTitle(String title) {
		this.title = title;
	}
	public String getCategory() {
		return category;
	}
	public void setCategory(String category) {
		this.category = category;
	}
	public String getTags() {
		return tags;
	}
	public void setTags(String tags) {
		this.tags = tags;
	}
	public String getThumbnail_url() {
		return thumbnail_url;
	}
	public void setThumbnail_url(String thumbnail_url) {
		this.thumbnail_url = thumbnail_url;
	}
	public String getIsprivate() {
		return isprivate;
	}
	public void setIsprivate(String isprivate) {
		this.isprivate = isprivate;
	}
	public String getIntroduction() {
		return introduction;
	}
	public void setIntroduction(String introduction) {
		this.introduction = introduction;
	}
	public String getGuide() {
		return guide;
	}
	public void setGuide(String guide) {
		this.guide = guide;
	}
	public String getNotes() {
		return notes;
	}
	public void setNotes(String notes) {
		this.notes = notes;
	}
	public String getIsagree() {
		return isagree;
	}
	public void setIsagree(String isagree) {
		this.isagree = isagree;
	}
	public String getIsdelete() {
		return isdelete;
	}
	public void setIsdelete(String isdelete) {
		this.isdelete = isdelete;
	}
	public int getComment_count() {
		return comment_count;
	}
	public void setComment_count(int comment_count) {
		this.comment_count = comment_count;
	}
	public int getView_count() {
		return view_count;
	}
	public void setView_count(int view_count) {
		this.view_count = view_count;
	}
	public int getLike_count() {
		return like_count;
	}
	public void setLike_count(int like_count) {
		this.like_count = like_count;
	}
	public int getBookmark_count() {
		return bookmark_count;
	}
	public void setBookmark_count(int bookmark_count) {
		this.bookmark_count = bookmark_count;
	}
	public Timestamp getCreated_at() {
		return created_at;
	}
	public void setCreated_at(Timestamp created_at) {
		this.created_at = created_at;
	}
	public Timestamp getUpdated_at() {
		return updated_at;
	}
	public void setUpdated_at(Timestamp updated_at) {
		this.updated_at = updated_at;
	}
	@Override
	public String toString() {
		return "ProjectDTO [project_id=" + project_id + ", title=" + title + ", category=" + category + ", tags=" + tags
				+ ", thumbnail_url=" + thumbnail_url + ", isprivate=" + isprivate + ", introduction=" + introduction
				+ ", guide=" + guide + ", notes=" + notes + ", isagree=" + isagree + ", isdelete=" + isdelete
				+ ", comment_count=" + comment_count + ", view_count=" + view_count + ", like_count=" + like_count
				+ ", bookmark_count=" + bookmark_count + ", created_at=" + created_at + ", updated_at=" + updated_at
				+ "]";
	}
}
