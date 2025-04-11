package com.boot.tico.erp.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.boot.tico.erp.dto.UserColorPaletteDTO;
import com.boot.tico.erp.service.UserColorPaletteService;

import lombok.RequiredArgsConstructor;

/**
 * 사용자 색상 팔레트 관리 컨트롤러
 * - 색상 추가, 조회, 삭제 기능 제공
 */
@RestController
@RequestMapping("/api/user-colors")
@RequiredArgsConstructor
public class UserColorPaletteController {

    private final UserColorPaletteService service;

    /**
     * ✅ 사용자 색상 추가 API
     * URL: POST /api/user-colors
     * Params: empId, empColor
     * Description: 사용자의 색상을 DB에 추가
     */
    @PostMapping
    public ResponseEntity<UserColorPaletteDTO> addColor(@RequestBody UserColorPaletteDTO dto) {
        UserColorPaletteDTO saved = service.addColor(dto.getEmpId(), dto.getEmpColor());
        return ResponseEntity.ok(saved);
    }

    /**
     * ✅ 사용자 색상 목록 조회 API
     * URL: GET /api/user-colors/{empId}
     * Description: 해당 사원이 등록한 색상 목록을 반환
     */
    @GetMapping("/{empId}")
    public ResponseEntity<List<UserColorPaletteDTO>> getColors(@PathVariable String empId) {
        List<UserColorPaletteDTO> colors = service.getColors(empId);
        return ResponseEntity.ok(colors);
    }

    /**
     * ✅ 사용자 색상 삭제 API
     * URL: DELETE /api/user-colors?empId=xxx&empColor=xxx
     * Description: 사용자가 선택한 색상을 DB에서 제거
     */
    @DeleteMapping
    public ResponseEntity<Void> deleteColor(@RequestBody UserColorPaletteDTO dto) {
        service.deleteColor(dto.getEmpId(), dto.getEmpColor());
        return ResponseEntity.noContent().build();
    }
}
