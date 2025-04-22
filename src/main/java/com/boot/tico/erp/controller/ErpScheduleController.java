package com.boot.tico.erp.controller;

import com.boot.tico.erp.dto.ErpScheduleDTO;
import com.boot.tico.erp.service.ErpScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 일정 관련 API 컨트롤러
 * - 등록, 조회, 수정, 삭제 기능 제공
 * - 예외 처리 포함하여 안정적인 API 제공
 */
@RestController
@RequestMapping("/api/schedule")
@RequiredArgsConstructor
public class ErpScheduleController {

    private final ErpScheduleService scheduleService;

    /**
     * 사원 ID로 일정 전체 조회
     * GET /api/schedule/employee/{empId}
     */
    @GetMapping("/employee/{empId}")
    public ResponseEntity<?> getSchedulesByEmpId(@PathVariable String empId) {
        try {
            return ResponseEntity.ok(scheduleService.getSchedulesByEmpId(empId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("일정 조회 실패: " + e.getMessage());
        }
    }
    
    /**
     * 일정 등록
     * POST /api/schedule
     */
    @PostMapping
    public ResponseEntity<?> createSchedule(@RequestBody ErpScheduleDTO schedule) {
        try {
            return ResponseEntity.ok(scheduleService.createSchedule(schedule));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("일정 등록 실패: " + e.getMessage());
        }
    }

    /**
     * 일정 제목으로 부분 검색
     * GET /api/schedule/title?title=키워드
     */
    @GetMapping("/title")
    public ResponseEntity<?> getSchedulesByTitle(@RequestParam String title) {
        try {
            return ResponseEntity.ok(scheduleService.getSchedulesByTitle(title));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("일정 제목 검색 실패: " + e.getMessage());
        }
    }

    /**
     * 일정 상세 조회 (ID 기준)
     * GET /api/schedule/detail/{id}
     */
    @GetMapping("/detail/{id}")
    public ResponseEntity<?> getScheduleById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(scheduleService.getScheduleById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("해당 일정이 존재하지 않습니다. ID: " + id);
        }
    }

    /**
     * 일정 수정
     * PUT /api/schedule/update/{id}
     */
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateSchedule(@PathVariable Long id, @RequestBody ErpScheduleDTO schedule) {
        try {
            return ResponseEntity.ok(scheduleService.updateSchedule(id, schedule));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("일정 수정 실패: " + e.getMessage());
        }
    }

    /**
     * 일정 삭제
     * DELETE /api/schedule/delete/{id}
     */
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteSchedule(@PathVariable Long id) {
        try {
            scheduleService.deleteSchedule(id);
            return ResponseEntity.ok("삭제 완료");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("일정 삭제 실패: " + e.getMessage());
        }
    }
}
