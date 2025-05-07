package com.boot.tico.study.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.boot.tico.study.dto.StudyDTO;
import com.boot.tico.study.repo.StudyRepository;

@Service
public class StudyService {

    @Autowired
    private StudyRepository repo;

    /**
     * 새로운 스터디를 생성합니다.
     * @param dto 생성할 스터디 데이터 (StudyDTO)
     */
    @Transactional
    public void createStudy(StudyDTO dto) {
        // [1] study_id 직접 생성
        int newStudyId = repo.getLatestStudyId() + 1;
        dto.setStudyId(newStudyId);  // 새로운 study_id 설정

        // [2] 사용자가 만든 스터디 수에 따라 번호 계산 (count + 1)
        int studyCount = repo.countByUserUuid(dto.getUserUuid());
        dto.setNumber(studyCount + 1);  // 번호 계산 후 설정

        // 저장
        repo.save(dto);  // 새로운 스터디 저장
    }

    /**
     * 모든 스터디 목록을 조회합니다.
     * @return 모든 스터디 목록
     */
    @Transactional(readOnly = true)
    public List<StudyDTO> getAllStudies() {
        List<Object[]> results = repo.findAllStudies();  // Repository에서 모든 스터디 가져오기
        List<StudyDTO> studies = new ArrayList<>();

        // 결과를 DTO로 변환
        for (Object[] result : results) {
            StudyDTO studyDTO = StudyDTO.builder()
                .studyId((Integer) result[0])
                .title((String) result[1])
                .introduction((String) result[2])
                .category((String) result[3])
                .difficulty((String) result[4])
                .duration((String) result[5])
                .isprivate((String) result[6])
                .nickname((String) result[7])
                .thumbnailUrl((String) result[8])
                .build();
            studies.add(studyDTO);  // 변환된 DTO를 목록에 추가
        }
        return studies;  // 변환된 스터디 목록 반환
    }

    /**
     * 특정 사용자가 만든 스터디 목록을 조회합니다.
     * @param userUuid 사용자의 UUID
     * @return 해당 사용자의 스터디 목록
     */
    @Transactional(readOnly = true)
    public List<StudyDTO> getStudiesByUser(String userUuid) {
        List<Object[]> results = repo.findStudiesByUser(userUuid);  // 사용자별 스터디 목록 조회
        List<StudyDTO> studies = new ArrayList<>();

        // 결과를 DTO로 변환
        for (Object[] result : results) {
            StudyDTO studyDTO = StudyDTO.builder()
                .studyId((Integer) result[0])
                .title((String) result[1])
                .introduction((String) result[2])
                .category((String) result[3])
                .difficulty((String) result[4])
                .duration((String) result[5])
                .isprivate((String) result[6])
                .thumbnailUrl((String) result[7])
                .build();
            studies.add(studyDTO);  // 변환된 DTO를 목록에 추가
        }
        return studies;  // 변환된 스터디 목록 반환
    }

    /**
     * 특정 사용자의 비공개 스터디 목록을 조회합니다.
     * @param userUuid 사용자의 UUID
     * @return 해당 사용자의 비공개 스터디 목록
     */
    @Transactional(readOnly = true)
    public List<StudyDTO> getPrivateStudiesByUser(String userUuid) {
        List<Object[]> results = repo.findPrivateStudiesByUser(userUuid);  // 사용자별 비공개 스터디 목록 조회
        List<StudyDTO> studies = new ArrayList<>();

        // 결과를 DTO로 변환
        for (Object[] result : results) {
            StudyDTO studyDTO = StudyDTO.builder()
                .studyId((Integer) result[0])
                .title((String) result[1])
                .introduction((String) result[2])
                .goal((String) result[3])  // goal 필드 설정
                .category((String) result[4])
                .difficulty((String) result[5])
                .duration((String) result[6])
                .isprivate((String) result[7])
                .thumbnailUrl((String) result[8])
                .build();
            studies.add(studyDTO);  // 변환된 DTO를 목록에 추가
        }
        return studies;  // 변환된 비공개 스터디 목록 반환
    }

    /**
     * 공개 스터디 목록을 조회합니다.
     * @return 공개 스터디 목록
     */
    @Transactional(readOnly = true)
    public List<StudyDTO> getPublicStudies() {
        List<Object[]> results = repo.findPublicStudies();  // Repository에서 공개된 스터디 가져오기
        List<StudyDTO> studies = new ArrayList<>();

        // 결과를 DTO로 변환
        for (Object[] result : results) {
            StudyDTO studyDTO = StudyDTO.builder()
                .studyId((Integer) result[0])
                .title((String) result[1])
                .introduction((String) result[2])
                .category((String) result[3])
                .difficulty((String) result[4])
                .duration((String) result[5])
                .isprivate((String) result[6])
                .nickname((String) result[7])
                .thumbnailUrl((String) result[8])
                .build();
            studies.add(studyDTO);  // 변환된 DTO를 목록에 추가
        }

        return studies;  // 변환된 공개 스터디 목록 반환
    }

    /**
     * 스터디를 공개로 설정하여 공유합니다.
     * @param studyDTO 공유할 스터디 데이터 (StudyDTO)
     */
    @Transactional
    public void shareStudy(StudyDTO studyDTO) {
        repo.updateShareInfo(  // 스터디 공유 상태 업데이트
            studyDTO.getStudyId(),
            studyDTO.getCategory(),
            studyDTO.getIntroduction(),
            studyDTO.getGoal(),
            studyDTO.getDifficulty(),
            studyDTO.getDuration(),
            "Y", "N"  // 공유 상태 및 동의 여부 설정
        );
    }

    /**
     * 특정 스터디의 상세 정보를 조회합니다.
     * @param studyId 조회할 스터디의 ID
     * @return 스터디의 상세 정보 (StudyDTO)
     */
    public StudyDTO getStudyDetail(Integer studyId) {
        return repo.findById(studyId).orElse(null);  // 해당 ID의 스터디를 조회하고 없으면 null 반환
    }

    /**
     * 스터디의 비공개 상태와 동의 여부를 업데이트합니다.
     * @param studyId 스터디 ID
     * @param isPrivate 비공개 여부
     * @param isAgree 동의 여부
     */
    @Transactional
    public void updatePrivateStatus(int studyId, String isPrivate, String isAgree) {
        StudyDTO study = repo.findById(studyId)
                .orElseThrow(() -> new RuntimeException("해당 스터디가 존재하지 않습니다."));
        study.setIsprivate(isPrivate);  // 비공개 상태 설정
        study.setIsagree(isAgree);  // 동의 여부 설정
        repo.updateProjectPrivateStatusAndAgree(studyId, isPrivate, isAgree);  // 데이터베이스 업데이트
    }

    /**
     * 특정 스터디를 삭제 상태로 변경합니다.
     * @param studyId 삭제할 스터디의 ID
     */
    @Transactional
    public void deleteStudyById(int studyId) {
        StudyDTO study = repo.findById(studyId)
                .orElseThrow(() -> new RuntimeException("해당 스터디가 존재하지 않습니다."));
        study.setIsdelete("Y");  // 삭제 상태로 설정
        // JPA는 변경 감지로 자동으로 업데이트
    }

    /**
     * 스터디의 메타데이터를 업데이트합니다.
     * @param dto 업데이트할 스터디 데이터 (StudyDTO)
     */
    @Transactional
    public void updateProjectMeta(StudyDTO dto) {
        StudyDTO entity = repo.findById(dto.getStudyId())
                .orElseThrow(() -> new RuntimeException("해당 스터디가 존재하지 않습니다."));
        
        // 필요한 메타데이터만 갱신
        entity.setProjectId(dto.getProjectId());
        entity.setTitle(dto.getTitle());
        entity.setCategory(dto.getCategory());
        entity.setDifficulty(dto.getDifficulty());
        entity.setDuration(dto.getDuration());
        entity.setGoal(dto.getGoal());
        entity.setIntroduction(dto.getIntroduction());
        entity.setIsprivate(dto.getIsprivate());
        entity.setIscomment(dto.getIscomment());

        repo.save(entity);  // 변경된 엔티티 저장
    }

    /**
     * 스터디의 댓글 상태를 업데이트합니다.
     * @param studyId 스터디 ID
     * @param isComment 댓글 활성화 여부
     */
    @Transactional
    public void updateCommentStatus(int studyId, String isComment) {
        StudyDTO study = repo.findById(studyId)
                .orElseThrow(() -> new RuntimeException("해당 작품이 존재하지 않습니다."));
        study.setIscomment(isComment);  // 댓글 활성화 여부 설정
        repo.save(study);  // 변경된 스터디 저장
    }

    /**
     * 사용자의 스터디 목록에 스터디를 추가합니다.
     * @param studyId 스터디 ID
     * @param userUuid 사용자의 UUID
     * @param duration 소요 시간
     * @param difficulty 난이도
     */
    @Transactional
    public void addStudyToUser(Integer studyId, String userUuid, String duration, String difficulty) {
        // 사용자가 다른 사람의 스터디만 추가할 수 있도록 체크
        StudyDTO study = repo.findById(studyId)
                .orElseThrow(() -> new RuntimeException("스터디가 존재하지 않습니다."));
        
        if (study.getUserUuid().equals(userUuid)) {
            throw new RuntimeException("자신의 스터디는 추가할 수 없습니다.");
        }
        
        StudyDTO newStudy = new StudyDTO();
        int newStudyId = repo.getLatestStudyId() + 1;
        
        newStudy.setStudyId(newStudyId);
        newStudy.setProjectId(study.getProjectId());
        newStudy.setUserUuid(userUuid);  // 사용자 UUID 설정
        newStudy.setTitle("[추가] " + study.getTitle());  // 제목에 '추가' 표시
        newStudy.setCategory(study.getCategory());
        newStudy.setIntroduction(study.getIntroduction());
        newStudy.setGoal(study.getGoal());  // 목표 설정
        newStudy.setDifficulty(difficulty);  // 난이도 설정
        newStudy.setDuration(duration);  // 소요 시간 설정

        int studyCount = repo.countByUserUuid(userUuid);
        newStudy.setNumber(studyCount + 1);  // 스터디 번호 설정
        newStudy.setIsadded("Y");  // 추가된 스터디로 설정

        repo.save(newStudy);  // 새로운 스터디 저장
    }
}
