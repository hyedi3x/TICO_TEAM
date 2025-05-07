package com.boot.tico.study.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.boot.tico.project.dto.ProjectDTO;
import com.boot.tico.study.dto.StudyDTO;
import com.boot.tico.study.repo.StudyRepository;

@Service
public class StudyService {

	@Autowired
	private StudyRepository repo;
	
	@Transactional
	public void createStudy(StudyDTO dto) {
		// [1] study_id 직접 생성
	    int newStudyId = repo.getLatestStudyId() + 1;
	    dto.setStudyId(newStudyId);

	    // [2] 사용자별 number 계산 → count + 1
	    int studyCount = repo.countByUserUuid(dto.getUserUuid());
	    dto.setNumber(studyCount + 1);

        // 저장
	    repo.save(dto);
    }
	
	@Transactional(readOnly = true)
	public List<StudyDTO> getAllStudies() {
		List<Object[]> results = repo.findAllStudies();
		
		// 결과 리스트를 DTO로 변환
        List<StudyDTO> studies = new ArrayList<>();
        
        for (Object[] result : results) {
            StudyDTO studyDTO = StudyDTO.builder()
                .studyId((Integer) result[0])            // study_id
                .title((String) result[1])               // title
                .introduction((String) result[2])        // introduction
                .category((String) result[3])            // category
                .difficulty((String) result[4])          // difficulty
                .duration((String) result[5])            // duration
                .isprivate((String) result[6])           // isprivate
                .nickname((String) result[7])        // thumbnail_url
                .thumbnailUrl((String) result[8])        // thumbnail_url
                .build();
            
            // List에 추가
            studies.add(studyDTO);
        }
        return studies;
	}
	
	@Transactional(readOnly = true)
	public List<StudyDTO> getStudiesByUser(String userUuid) {
		// nativeQuery로 반환된 결과를 Object[]로 받아옵니다.
        List<Object[]> results = repo.findStudiesByUser(userUuid);
        
        // 결과 리스트를 DTO로 변환
        List<StudyDTO> studies = new ArrayList<>();
        
        for (Object[] result : results) {
            StudyDTO studyDTO = StudyDTO.builder()
                .studyId((Integer) result[0])            // study_id
                .title((String) result[1])               // title
                .introduction((String) result[2])        // introduction
                .category((String) result[3])            // category
                .difficulty((String) result[4])          // difficulty
                .duration((String) result[5])            // duration
                .isprivate((String) result[6])           // isprivate
                .thumbnailUrl((String) result[7])        // thumbnail_url
                .build();
            
            // List에 추가
            studies.add(studyDTO);
        }
        return studies;
	}
	
	@Transactional(readOnly = true)
	public List<StudyDTO> getPrivateStudiesByUser(String userUuid) {
		
		List<Object[]> results = repo.findPrivateStudiesByUser(userUuid);
        
        // 결과 리스트를 DTO로 변환
        List<StudyDTO> studies = new ArrayList<>();
        
        for (Object[] result : results) {
            StudyDTO studyDTO = StudyDTO.builder()
                .studyId((Integer) result[0])            // study_id
                .title((String) result[1])               // title
                .introduction((String) result[2])        // introduction
                .goal((String) result[3])        		 // introduction
                .category((String) result[4])            // category
                .difficulty((String) result[5])          // difficulty
                .duration((String) result[6])            // duration
                .isprivate((String) result[7])           // isprivate
                .thumbnailUrl((String) result[8])        // thumbnail_url
                .build();
            
            // List에 추가
            studies.add(studyDTO);
        }
        return studies;
	}
	
	@Transactional(readOnly = true)
	public List<StudyDTO> getPublicStudies() {
	    List<Object[]> results = repo.findPublicStudies();  // Repository에서 공개된 스터디 가져오기
	    List<StudyDTO> studies = new ArrayList<>();

	    for (Object[] result : results) {
	        StudyDTO studyDTO = StudyDTO.builder()
	            .studyId((Integer) result[0])  // study_id
	            .title((String) result[1])     // title
	            .introduction((String) result[2])  // introduction
	            .category((String) result[3])     // category
	            .difficulty((String) result[4])   // difficulty
	            .duration((String) result[5])     // duration
	            .isprivate((String) result[6])    // isprivate
	            .nickname((String) result[7])     // nickname
	            .thumbnailUrl((String) result[8]) // thumbnail_url
	            .build();
	        studies.add(studyDTO);
	    }

	    return studies;
	}
	
	// 스터디를 공유 상태로 변경 (공개로 설정)
	@Transactional
	public void shareStudy(StudyDTO studyDTO) {
	    repo.updateShareInfo(
	        studyDTO.getStudyId(),
	        studyDTO.getCategory(),
	        studyDTO.getIntroduction(),
	        studyDTO.getGoal(),
	        studyDTO.getDifficulty(),
	        studyDTO.getDuration(),
	        "Y", "N"
	    );
	}
	
	// 스터디 상세 정보 조회
    public StudyDTO getStudyDetail(Integer studyId) {
        return repo.findById(studyId).orElse(null); // 없으면 null 반환
    }
    
    @Transactional
    public void updatePrivateStatus(int studyId, String isPrivate, String isAgree) {
 	   StudyDTO study = repo.findById(studyId)
 			   .orElseThrow(() -> new RuntimeException("해당 스터디가 존재하지 않습니다."));
 	   study.setIsprivate(isPrivate);
 	   study.setIsagree(isAgree);
 	   repo.updateProjectPrivateStatusAndAgree(studyId, isPrivate, isAgree);
    }
    
    @Transactional
    public void deleteStudyById(int studyId) {
        StudyDTO study = repo.findById(studyId)
            .orElseThrow(() -> new RuntimeException("해당 스터디가 존재하지 않습니다."));
        study.setIsdelete("Y");
        // JPA는 변경 감지로 자동 update 됨
    }

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

        repo.save(entity);
    }
    
    @Transactional
    public void updateCommentStatus(int studyId, String isComment) {
        StudyDTO study = repo.findById(studyId)
                .orElseThrow(() -> new RuntimeException("해당 작품이 존재하지 않습니다."));
        study.setIscomment(isComment);
        repo.save(study);
    }
    
    @Transactional
    public void addStudyToUser(Integer studyId, String userUuid, String duration, String difficulty) {
        // 사용자와 스터디를 연결하는 로직
        StudyDTO study = repo.findById(studyId)
                .orElseThrow(() -> new RuntimeException("스터디가 존재하지 않습니다."));
        
        if (study.getUserUuid().equals(userUuid)) {
            throw new RuntimeException("자신의 스터디는 추가할 수 없습니다.");
        }
        
        StudyDTO newStudy = new StudyDTO();
	    int newStudyId = repo.getLatestStudyId() + 1;
	    
	    newStudy.setStudyId(newStudyId);
	    newStudy.setProjectId(study.getProjectId());
	    newStudy.setUserUuid(userUuid);  // 사용자 UUID 추가
	    newStudy.setTitle("[추가] " + study.getTitle());
	    newStudy.setCategory(study.getCategory());
	    newStudy.setIntroduction(study.getIntroduction());
	    newStudy.setGoal(study.getGoal()); // goal 설정
	    newStudy.setDifficulty(difficulty);  // 난이도 설정
	    newStudy.setDuration(duration);  // 소요 시간 설정

	    int studyCount = repo.countByUserUuid(userUuid);
	    newStudy.setNumber(studyCount + 1);
	    newStudy.setIsadded("Y");  // 'Y'로 설정

        repo.save(newStudy);
    }
}
