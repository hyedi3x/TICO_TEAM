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
	    return repo.findAllStudies();
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
        return repo.findById(studyId)
                .orElse(null); // 없으면 null 반환
    }
}
