package com.boot.tico.erp.dto;

import java.sql.Date;
import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data	// getter, setter, toString(), equals(), hashCode()...
@AllArgsConstructor	// 매개변수 생성자
@NoArgsConstructor	// 디폴트 생성자

@Entity		// 해당 클래스가 JPA 엔티티임을 명시. 데이터베이스의 테이블과 매핑되는 클래스. ORM(db의 table의 컬럼과 object의 멤버변수를 매핑)
@Table(name = "erp_notices")	// 데이터베이스 테이블 이름을 지정
public class ErpNotiDTO {
	@Id		// 기본 키(primary key) 필드를 지정
	@GeneratedValue(strategy = GenerationType.IDENTITY)		// insert시 db가 자동 증가(auto-increment)컬럼을 관리하도록 설정. (다른 방법으로는 GenerationType.SEQUENCE)
	@Column(name = "erp_noti_id")	// 각 필드를 데이터베이스 컬럼과 매핑
    private Long erpNotiId;

    @Column(name = "erp_noti_title")
    private String erpNotiTitle;

    @Column(name = "erp_noti_content")
    private String erpNotiContent;

    @Column(name = "emp_id")
    private String empId;

    @Column(name = "erp_noti_created_at")
    private Timestamp erpNotiCreatedAt;

    @Column(name = "erp_noti_updated_at")
    private Timestamp erpNotiUpdatedAt;

    @Column(name = "erp_noti_status")
    private String erpNotiStatus;

    @Column(name = "erp_noti_view_count")
    private int erpNotiViewCount;

    @Column(name = "erp_noti_type")
    private String erpNotiType;

    @Column(name = "erp_noti_expired_at")
    private Date erpNotiExpiredAt;
    
    @Column(name = "erp_noti_file")
    private String erpNotiFile;
    
    @Column(name = "erp_noti_original_file")
    private String erpNotiOriginalFile;
}
