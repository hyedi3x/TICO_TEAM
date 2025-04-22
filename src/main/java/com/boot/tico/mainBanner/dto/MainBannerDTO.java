package com.boot.tico.mainBanner.dto;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
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
@Table(name = "main_banner_tb")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class MainBannerDTO {
	
	@Id
	@Column(name="banner_id")
    private int bannerId;
    @Column(name="emp_id", nullable = false)
    private String empId;
    @Column(name="banner_image", nullable = false)
    private String bannerImage;
    @Column(name="banner_link")
    private String bannerLink;
    @Column(name="banner_title")
    private String bannerTitle;
    @Column(name="is_delete", nullable = false)
    private String isDelete;
    @Column(name="display_order")
    private int displayOrder;
    @Column(name = "created_at", insertable = false, updatable = false)
	private Timestamp createdAt;
	@Column(name="updated_at", insertable = false, updatable = false)
	private Timestamp updatedAt;
    
	@PrePersist // JPA에서 엔티티가 DB에 저장되기 전, INSERT 되기 직전에 실행되는 콜백 메서드
    public void prePersist() {
        if (this.isDelete == null) {
            this.isDelete = "N";  // null이면 직접 채워줌
        }
    }
	
}
