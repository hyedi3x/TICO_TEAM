package com.boot.tico.purchase.dto;

import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import javax.persistence.Table;

import com.boot.tico.login.entity.User;
import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name="user_subscription")
public class Purchase {
	@Id
	@Column(name = "user_uuid", length = 36)
	private String userUuid; // 그대로 유지 (PK)

	/* Purchase → User 관계는 다대일(ManyToOne) 관계
	 * : 여러 구독(Purchase)이 하나의 유저(User)에 연결될 수 있다는 의미.
	 * 
	 * fetch = FetchType.LAZY는 지연 로딩을 의미
	 * → 처음엔 user를 로딩하지 않고, p.getUser()가 호출될 때 DB에서 조회됨.
	 * 
	 * @JoinColumn(name = "user_uuid", insertable = false, updatable = false)
	 * userUuid라는 진짜 컬럼 필드가 존재한다. (private String userUuid;)
	 * 단순 조회의 목적으로 private User user; 선언 
	 * -> 단순히 연결을 위한 조회용이라, 실제 DB에 값을 insert/update하지 않음.
	 * 
	 * @JsonIgnore
	 */
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_uuid", insertable = false, updatable = false) // 외래키 연결
	@JsonIgnore
	private User user;
	
    @Column(name = "active", nullable = false)
    private boolean active = false;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "subscription_type", nullable = false)
    private String subscriptionType = "basic";
    
    @Column(name = "transaction_id", unique = true)
    private String transactionId; // 추가: 결제 고유 ID

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate		// 수정시 updateAt 갱신
    public void setUpdatedAt() {
        this.updatedAt = LocalDateTime.now();
    }
}
