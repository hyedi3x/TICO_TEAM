package com.boot.tico.erp.dto;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

//@NoArgsConstructor : 기본 생성자, @AllArgsConstructor: 모든 필드를 파라미터로 받는 생성자
//@Data : @Getter, @Setter, @RequiredArgsConstructor, @EqualsAndHashCode, @ToString 포함

@Entity
@Table(name = "jobs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobDTO {
    @Id
    @Column(name = "job_id")
    private String jobId;

    @Column(name = "job_title")
    private String jobName;
    
    // @ManyToOne(fetch = FetchType.EAGER) : JobDTO를 조회할 때 자동으로 연결된 DepDTO도 같이 가져옴
    // @ManyToOne : 두 개의 엔티티 간의 다대일(N:1) 관계를 맵핑
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "dep_id")
    private DepDTO depId;
}
