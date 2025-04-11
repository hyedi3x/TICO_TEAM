package com.boot.tico.erp.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.boot.tico.erp.dto.UserColorPaletteDTO;
import com.boot.tico.erp.repo.UserColorPaletteRepository;

import lombok.RequiredArgsConstructor;

/**
 * 사용자 색상 팔레트 관련 비즈니스 로직 처리 서비스
 */
@Service
@RequiredArgsConstructor
public class UserColorPaletteService {

    private final UserColorPaletteRepository repo;

    /**
     * 사용자 색상 추가
     * - 중복 색상 여부를 체크하고 없을 경우 새로 저장
     *
     * @param empId 사원 ID
     * @param empColor 등록할 색상
     * @return 저장된 색상 정보
     */
    @Transactional
    public UserColorPaletteDTO addColor(String empId, String empColor) {
        if (repo.existsByEmpIdAndEmpColor(empId, empColor)) {
            throw new IllegalArgumentException("이미 등록된 색상입니다.");
            
        }
        return repo.save(UserColorPaletteDTO.builder()
                .empId(empId)
                .empColor(empColor)
                .build());
    }

    /**
     * 특정 사원의 저장된 색상 목록 조회
     *
     * @param empId 사원 ID
     * @return 색상 목록
     */
    @Transactional(readOnly = true)
    public List<UserColorPaletteDTO> getColors(String empId) {
        return repo.findByEmpId(empId);
    }

    /**
     * 특정 사원의 특정 색상 삭제
     *
     * @param empId 사원 ID
     * @param empColor 삭제할 색상
     */
    @Transactional
    public void deleteColor(String empId, String empColor) {
        repo.deleteByEmpIdAndEmpColor(empId, empColor);
    }
}
