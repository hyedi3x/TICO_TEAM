package com.boot.tico.erp.repo;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.boot.tico.erp.dto.UserColorPaletteDTO;

/**
 * 사용자 색상 팔레트 Repository
 * - JpaRepository를 상속받아 기본적인 CRUD 기능 제공
 * - 사용자 색상 관련 조회/중복 확인/삭제 기능 추가
 */
public interface UserColorPaletteRepository extends JpaRepository<UserColorPaletteDTO, Long> {

    /**
     * 특정 사원이 등록한 모든 색상 목록을 조회
     * @param empId 사원 ID
     * @return 색상 목록
     */
    List<UserColorPaletteDTO> findByEmpId(String empId);

    /**
     * 특정 사원이 특정 색상을 이미 등록했는지 확인
     * @param empId 사원 ID
     * @param empColor 색상 코드
     * @return 존재 여부
     */
    boolean existsByEmpIdAndEmpColor(String empId, String empColor);

    /**
     * 특정 사원의 특정 색상을 삭제
     * @param empId 사원 ID
     * @param empColor 색상 코드
     */
    void deleteByEmpIdAndEmpColor(String empId, String empColor);
}
