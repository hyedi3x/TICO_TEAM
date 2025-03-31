package com.boot.tico.erp.dto;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// @NoArgsConstructor : 기본 생성자, @AllArgsConstructor: 모든 필드를 파라미터로 받는 생성자
// @Data : @Getter, @Setter, @RequiredArgsConstructor, @EqualsAndHashCode, @ToString 포함

@Entity
@Table(name = "DEPARTMENT")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DepDTO {

    @Id
    @Column(name = "dep_id")
    private String depId;
    
    @Column(name = "dep_name")
    private String depName;
    
}
