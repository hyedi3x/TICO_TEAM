package com.boot.tico.erp.service;

import com.boot.tico.erp.dto.ErpScheduleDTO;
import com.boot.tico.erp.repo.ErpScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ErpScheduleService {

    private final ErpScheduleRepository repo;

    /**
     * 일정 등록
     * - 새로운 일정을 생성하여 DB에 저장
     * - 트랜잭션 필요 (데이터 변경 작업)
     */
    @Transactional
    public ErpScheduleDTO createSchedule(ErpScheduleDTO schedule) {
        LocalDateTime now = LocalDateTime.now();
        schedule.setErpScheduleCreateAt(now);       // 생성일 자동 세팅
        schedule.setErpScheduleUpdatedAt(now);      // 수정일도 초기값 세팅
        return repo.save(schedule);
    }

    /**
     * 사원별 전체 일정 조회
     * - 해당 사원의 모든 일정 목록 반환
     * - 읽기 전용이므로 readOnly 최적화 적용
     */
    @Transactional(readOnly = true)
    public List<ErpScheduleDTO> getSchedulesByEmpId(String empId) {
        return repo.findByEmpId(empId);
    }

    /**
     * 일정 제목으로 검색
     * - 일정 제목으로 부분 검색 가능
     * - 읽기만 수행하므로 readOnly 적용
     */
    @Transactional(readOnly = true)
    public List<ErpScheduleDTO> getSchedulesByTitle(String keyword) {
        return repo.findByErpScheduleTitleContaining(keyword);
    }

    /**
     * 일정 ID로 상세 조회
     * - ID를 기준으로 단일 일정 조회
     * - 존재하지 않으면 예외 발생
     * - 읽기 전용 → readOnly 최적화
     */
    @Transactional(readOnly = true)
    public ErpScheduleDTO getScheduleById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 일정이 존재하지 않습니다. ID: " + id));
    }

    /**
     * 일정 수정
     * - ID로 기존 일정 불러와 수정 후 저장
     * - 트랜잭션 필요 (update)
     */
    @Transactional
    public ErpScheduleDTO updateSchedule(Long id, ErpScheduleDTO newSchedule) {
        // 기존 일정 불러오기
        ErpScheduleDTO existing = getScheduleById(id);

        // 필요한 필드 업데이트
        existing.setErpScheduleTitle(newSchedule.getErpScheduleTitle());
        existing.setErpScheduleContent(newSchedule.getErpScheduleContent());
        existing.setErpScheduleColor(newSchedule.getErpScheduleColor());
        existing.setErpScheduleStart(newSchedule.getErpScheduleStart());
        existing.setErpScheduleEnd(newSchedule.getErpScheduleEnd());
        existing.setErpScheduleUpdatedAt(LocalDateTime.now());

        return repo.save(existing);
    }

    /**
     * ✅ 일정 삭제
     * - ID로 일정 존재 여부 체크 후 삭제
     * - 트랜잭션 필요 (delete)
     */
    @Transactional
    public void deleteSchedule(Long id) {
        if (!repo.existsById(id)) {
            throw new IllegalArgumentException("삭제할 일정이 존재하지 않습니다. ID: " + id);
        }
        repo.deleteById(id);
    }
}
