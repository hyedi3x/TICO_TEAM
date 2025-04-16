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
import com.boot.tico.project.repo.ProjectObjectRepository;
import com.boot.tico.project.repo.ProjectRepository;

@Service
public class ProjectService {

   @Autowired
   private ProjectRepository projectRepository;

   @Autowired
   private ProjectObjectRepository objectRepository;

   /**
    * [1] 프로젝트 + 오브젝트 저장
    * - projectId 수동 생성 후 저장
    * - objectId도 수동 생성하며 각 오브젝트에 projectId 매핑
    */
   @Transactional
   public int saveProject(ProjectDTO project, List<ProjectObjectDTO> objectList) {
       System.out.println("ProjectService - saveProject()");

       // 1️⃣ project_id 직접 생성
       int newProjectId = projectRepository.getLatestProjectId() + 1;
       project.setProjectId(newProjectId);

       projectRepository.save(project);

       for (ProjectObjectDTO obj : objectList) {
    	   int newObjectId = objectRepository.getLatestObjectId() + 1;
           obj.setObjectId(newObjectId);  // 순차적으로 증가
           obj.setProjectId(newProjectId);        // FK 지정
           objectRepository.save(obj);
       }

       return newProjectId;
   }
   
   /**
    * [2] 전체 프로젝트 목록 조회 (isDelete = 'N')
    */
   public List<ProjectDTO> getAllProjects() {
       return projectRepository.findByIsDelete();
   }
   
   /**
    * [3] 유저가 만든 프로젝트 목록 조회
    */
   public List<ProjectDTO> getProjectsByUser(String userUuid) {
	    return projectRepository.findByUserUuid(userUuid);
	}

   /**
    * [4] 프로젝트 + 오브젝트 상세 조회
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
    * [5] 프로젝트 + 오브젝트 수정
    * - project 덮어쓰기
    * - 기존 object 삭제 후 새 object 재삽입
    */
   @Transactional
   public void updateProject(ProjectDTO project, List<ProjectObjectDTO> objectList) {
       if (project.getProjectId() == 0) throw new IllegalArgumentException("프로젝트 ID 없음");

       projectRepository.save(project);
       objectRepository.deleteByProjectId(project.getProjectId());
       for (ProjectObjectDTO obj : objectList) {
    	   int newObjectId = objectRepository.getLatestObjectId() + 1;
    	   obj.setObjectId(newObjectId);
           obj.setProjectId(project.getProjectId());
           objectRepository.save(obj);
       }
   }

   /**
    * [6] 프로젝트 삭제 처리
    * - 관련 오브젝트 삭제 + 프로젝트 isDelete = 'Y'로 표시
    */
   @Transactional
   public void deleteProject(int project_id) {
       ProjectDTO project = projectRepository.findById(project_id).orElse(null);
       if (project == null) throw new IllegalArgumentException("삭제할 프로젝트 없음");

       objectRepository.deleteByProjectId(project_id);
       project.setIsDelete("Y");
       projectRepository.save(project);
   }

   /**
    * [7] 이미지 파일 저장 (uploads 디렉토리에 저장 후 경로 반환)
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
    * [8] 공개된 프로젝트 조회 (isPrivate = 'N')
    */
   @Transactional
   public List<ProjectDTO> getPublicProjects() {
	    return projectRepository.findByIsPrivate();
	}
   
   /**
    * [9] 프로젝트 공유 처리 (isPrivate = 'N', isAgree = 'Y')
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

}
