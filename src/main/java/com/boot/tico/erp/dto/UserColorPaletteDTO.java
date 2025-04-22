package com.boot.tico.erp.dto;

import javax.persistence.*;

import lombok.*;

// Lombok 어노테이션: 생성자, getter/setter, builder 등을 자동 생성해줌
@Data                       // Getter/Setter, toString, equals/hashCode 자동 생성
@NoArgsConstructor          // 기본 생성자 생성
@AllArgsConstructor         // 모든 필드를 포함하는 생성자 생성
@Builder                    // Builder 패턴을 사용한 객체 생성 지원

// JPA 엔티티로 매핑
@Entity
@Table(
    name = "user_color_palette",  // 테이블 이름 지정
    uniqueConstraints = @UniqueConstraint(	// 중복을 허용하지 않는 조건 지정
        name = "uc_emp_color",    // 제약 조건 이름
        columnNames = {"emp_id", "emp_color"} // 같은 사원이 같은 색상을 중복 저장하지 못하도록 설정
    )
)
public class UserColorPaletteDTO {

    // 기본 키(PK), 자동 증가
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_color_id")
    private Long userColorId;  // 팔레트 고유 ID

    // 사원 ID (외래키로 사용될 필드)
    @Column(name = "emp_id", nullable = false)
    private String empId;

    // 사원이 등록한 색상 코드 (예: #3498db)
    @Column(name = "emp_color", nullable = false)
    private String empColor;
}
