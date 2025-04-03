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

   /** 저장 **/
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
   
   /** 목록 조회 **/
   public List<ProjectDTO> getAllProjects() {
       return projectRepository.findByIsDelete("N");
   }

   /** 상세 조회 **/
   public Map<String, Object> getProjectDetail(int projectId) {
       ProjectDTO project = projectRepository.findById(projectId).orElse(null);
       List<ProjectObjectDTO> objects = objectRepository.findByProjectId(projectId);

       Map<String, Object> result = new HashMap<>();
       result.put("project", project);
       result.put("objects", objects);
       return result;
   }

   /** 수정 **/
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

   /** 삭제 **/
   @Transactional
   public void deleteProject(int project_id) {
       ProjectDTO project = projectRepository.findById(project_id).orElse(null);
       if (project == null) throw new IllegalArgumentException("삭제할 프로젝트 없음");

       objectRepository.deleteByProjectId(project_id);
       project.setIsDelete("Y");
       projectRepository.save(project);
   }

   /** 이미지 저장 **/
   private final String uploadDir = System.getProperty("user.dir") + "/uploads/";

   public String saveFile(MultipartFile file) throws IOException {
       String originalFilename = file.getOriginalFilename();

       File folder = new File(uploadDir);
       if (!folder.exists()) folder.mkdirs();

       File dest = new File(uploadDir + originalFilename);
       file.transferTo(dest);

       return "/uploads/" + originalFilename;
   }
}
