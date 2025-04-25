package com.boot.tico.project.service;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.boot.tico.project.dto.ProjectDTO;
import com.boot.tico.project.dto.ProjectObjectDTO;
import com.boot.tico.project.dto.ProjectViewDTO;
import com.boot.tico.project.repo.ProjectObjectRepository;
import com.boot.tico.project.repo.ProjectRepository;
import com.boot.tico.project.repo.ProjectViewRepository;

@Service
public class ProjectService {

   @Autowired
   private ProjectRepository projectRepository;

   @Autowired
   private ProjectObjectRepository objectRepository;
   
   @Autowired
   private ProjectViewRepository viewRepository;

   /**
    * [1] 프로젝트 + 오브젝트 저장
    * - 프로젝트 ID를 수동으로 생성하여 저장
    * - 오브젝트 ID도 수동으로 생성하여 각 오브젝트에 projectId를 매핑
    * - 사용자가 만든 작품 수를 기반으로 number 컬럼을 설정
    */
   @Transactional
   public int saveProject(ProjectDTO project, List<ProjectObjectDTO> objectList) {
       System.out.println("ProjectService - saveProject()");

       // 프로젝트 ID 수동 생성
       int newProjectId = projectRepository.getLatestProjectId() + 1;
       project.setProjectId(newProjectId);
       
       // 사용자가 만든 작품 수에 따라 number 값 계산
       int userProjectCount = projectRepository.countByUserUuid(project.getUserUuid());  // 이 부분 추가
       int newProjectNumber = userProjectCount + 1;  // 사용자별 작품 순번 계산
       project.setNumber(newProjectNumber);  // 계산된 number 값 설정

       projectRepository.save(project);

       for (ProjectObjectDTO obj : objectList) {
    	   int newObjectId = objectRepository.getLatestObjectId() + 1;
    	   obj.setObjectId(newObjectId);  // 순차적으로 objectId 증가
           obj.setProjectId(newProjectId);  // 프로젝트 ID 매핑
           objectRepository.save(obj);
       }

       return newProjectNumber;
   }
   
   /**
    * [2] 전체 프로젝트 목록 조회
    * - 삭제되지 않은 전체 프로젝트 목록을 조회
    */
   public List<ProjectDTO> getAllProjects() {
       return projectRepository.findByIsDelete();
   }
   
   /**
    * [3] 특정 사용자가 만든 프로젝트 목록 조회
    * - 특정 사용자가 만든 삭제되지 않은 프로젝트 목록을 조회
    */
   public List<ProjectDTO> getProjectsByUser(String userUuid) {
	    return projectRepository.findByUserUuid(userUuid);
	}

   /**
    * [4] 프로젝트 및 오브젝트 상세 조회
    * - 특정 프로젝트와 관련된 오브젝트들을 포함한 상세 정보를 반환
    */
   public Map<String, Object> getProjectDetail(int projectId) {
       ProjectDTO project = projectRepository.findById(projectId).orElse(null);
       List<ProjectObjectDTO> objects = objectRepository.findByProjectId(projectId);

       Map<String, Object> result = new HashMap<>();
       result.put("project", project);
       result.put("objects", objects);
       return result;
   }

   /**
    * [5] 프로젝트 수정
    * - 프로젝트 정보를 덮어쓰고, 기존 오브젝트는 삭제 후 새로 삽입
    */
   @Transactional
   public int updateProject(ProjectDTO project, List<ProjectObjectDTO> objectList) {
       if (project.getProjectId() == 0) throw new IllegalArgumentException("프로젝트 ID 없음");

       // 기존 프로젝트 확인
       ProjectDTO existing = projectRepository.findById(project.getProjectId()).orElse(null);
       if (existing == null) throw new IllegalArgumentException("해당 프로젝트 없음");

       // 기존 값이 없는 필드는 기존 값으로 설정
       if (project.getIntroduction() == null) project.setIntroduction(existing.getIntroduction());
       if (project.getGuide() == null) project.setGuide(existing.getGuide());
       if (project.getNotes() == null) project.setNotes(existing.getNotes());
       if (project.getTags() == null) project.setTags(existing.getTags());
       if (project.getCategory() == null) project.setCategory(existing.getCategory());
       if (project.getIsPrivate() == null) project.setIsPrivate(existing.getIsPrivate());
       if (project.getIsAgree() == null) project.setIsAgree(existing.getIsAgree());
       if (project.getViewCount() == null) project.setViewCount(existing.getBookmarkCount());
       if (project.getLikeCount() == null) project.setLikeCount(existing.getLikeCount());
       if (project.getCommentCount() == null) project.setCommentCount(existing.getCommentCount());
       if (project.getBookmarkCount() == null) project.setBookmarkCount(existing.getBookmarkCount());
       if (project.getNumber() == null) project.setNumber(existing.getNumber());
       if (project.getIsComment() == null) project.setIsComment(existing.getIsComment());

       // 프로젝트 저장
       projectRepository.save(project);
       
       // 기존 오브젝트 삭제 후 새로운 오브젝트 삽입
       objectRepository.deleteByProjectId(project.getProjectId());
       for (ProjectObjectDTO obj : objectList) {
    	   int newObjectId = objectRepository.getLatestObjectId() + 1;
    	   obj.setObjectId(newObjectId);
           obj.setProjectId(project.getProjectId());
           objectRepository.save(obj);
       }
       
       return project.getNumber();
   }

   /**
    * [6] 프로젝트 삭제
    * - 관련 오브젝트 삭제 및 프로젝트를 soft delete 처리 (isDelete = 'Y')
    * - 삭제된 프로젝트의 number 값을 0으로 설정
    * - 삭제 후 해당 사용자의 프로젝트 번호 재배치
    */
   @Transactional
   public int deleteProject(int project_id) {
       ProjectDTO project = projectRepository.findById(project_id).orElse(null);
       if (project == null) throw new IllegalArgumentException("삭제할 프로젝트 없음");
       
       int deleteNum = project.getNumber();

       // 관련 오브젝트 삭제
       objectRepository.deleteByProjectId(project_id);
       
       // 프로젝트 삭제 처리
       project.setIsDelete("Y");
       project.setNumber(0);  // 삭제된 작품의 number 값을 0으로 설정
       projectRepository.save(project);
       
       // 삭제 후 사용자별 프로젝트 번호 재정렬
       reassignNumberByUserUuid(project.getUserUuid());
       
       return deleteNum;
   }
   
   /**
    * [7] 프로젝트 번호 재정렬
    * - 삭제된 프로젝트 이후, 사용자가 만든 프로젝트 번호를 순차적으로 재정렬
    */
   @Transactional
   public void reassignNumberByUserUuid(String userUuid) {
       // 삭제되지 않은 프로젝트만 가져오기
       List<ProjectDTO> projects = projectRepository.findByUserUuidAndIsDelete(userUuid);

       int counter = 1; // 시작 번호
       for (ProjectDTO project : projects) {
           project.setNumber(counter); // 순차적으로 number 값을 할당
           projectRepository.save(project); // 프로젝트 저장
           counter++; // 번호 증가
       }
   }

   /**
    * [8] 이미지 파일 저장
    * - 업로드된 이미지를 서버의 uploads 디렉토리에 저장하고, 해당 경로를 반환
    */
   private final String uploadDir = System.getProperty("user.dir") + "/uploads/";

   public String saveFile(MultipartFile file) throws IOException {
       String originalFilename = file.getOriginalFilename();

       File folder = new File(uploadDir);
       if (!folder.exists()) folder.mkdirs();

       File dest = new File(uploadDir + originalFilename);
       file.transferTo(dest);

       return "/uploads/" + originalFilename;
   }
   
   /**
    * [9] 공개된 프로젝트 조회
    * - 공개된 프로젝트 목록을 조회 (isPrivate = 'N')
    */
   @Transactional
   public List<ProjectDTO> getPublicProjects() {
	    return projectRepository.findByIsPrivate();
	}
   
   /**
    * [10] 프로젝트 공유 처리
    * - 프로젝트의 공개 설정 및 공유 동의 여부를 업데이트
    */
   @Transactional
   public void shareProject(ProjectDTO dto) {
       projectRepository.updateShareInfo(
           dto.getProjectId(),
           dto.getCategory(),
           dto.getTags(),
           dto.getIntroduction(),
           dto.getGuide(),
           dto.getNotes(),
           "Y", "N"
       );
   }
   
   /**
    * [11] 조회수 기록
    * - 사용자의 작품 조회 기록을 삽입
    */
   @Transactional
   public void recordUserView(int projectId, String userUuid) {
	   int newViewId = viewRepository.getLatestViewId() + 1;
	   
	   ProjectViewDTO view = new ProjectViewDTO();
	   view.setViewId(newViewId);
	   view.setUserUuid(userUuid != null ? userUuid : ""); // 로그인되지 않으면 빈 값으로 기록
	   view.setProjectId(projectId);
	   viewRepository.save(view);
   }
   
   /**
    * [12] 조회수 증가
    * - 조회수를 1 증가시키는 메서드
    */
   @Transactional
   public void incrementViewCount(int projectId) {
       projectRepository.incrementViewCount(projectId); // 조회수 증가
   }
   
   /**
    * [13] 작품 공개/비공개 변경 처리
    */
   @Transactional
   public void updatePrivateStatus(int projectId, String isPrivate, String isAgree) {
	   ProjectDTO project = projectRepository.findById(projectId)
			   .orElseThrow(() -> new RuntimeException("해당 작품이 존재하지 않습니다."));
	   project.setIsPrivate(isPrivate);
	   project.setIsAgree(isAgree);
	   projectRepository.updateProjectPrivateStatusAndAgree(projectId, isPrivate, isAgree);
   }
   
   /**
    * [14] 댓글 허용/비허용 변경 처리
    */
   @Transactional
   public void updateCommentStatus(int projectId, String isComment) {
       ProjectDTO project = projectRepository.findById(projectId)
               .orElseThrow(() -> new RuntimeException("해당 작품이 존재하지 않습니다."));
       project.setIsComment(isComment);
       projectRepository.save(project);
   }
   
   /**
    * [15] 작품의 정보만 수정 처리
    */
   @Transactional
   public void updateProjectMeta(ProjectDTO dto) {
       ProjectDTO entity = projectRepository.findById(dto.getProjectId())
           .orElseThrow(() -> new RuntimeException("해당 작품이 존재하지 않습니다."));
       
       // 필요한 메타데이터만 갱신
       entity.setTitle(dto.getTitle());
       entity.setCategory(dto.getCategory());
       entity.setTags(dto.getTags());
       entity.setIntroduction(dto.getIntroduction());
       entity.setGuide(dto.getGuide());
       entity.setNotes(dto.getNotes());
       entity.setIsPrivate(dto.getIsPrivate());
       entity.setIsComment(dto.getIsComment());

       projectRepository.save(entity);
   }

   
   // 메인화면 인기작품 조회
   @Transactional
   public List<ProjectDTO> getPopularProjects() {
	    return projectRepository.findPopularProjects();
	}
}
