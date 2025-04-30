package com.boot.tico.project.service;

import java.util.List;
import java.util.Optional;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.boot.tico.project.dto.ProjectStaffPickDTO;
import com.boot.tico.project.repo.ProjectStaffPickRepository;

@Service
public class ProjectStaffPickService {

    @Autowired
    private ProjectStaffPickRepository repository;
    
    // 조회
    @Transactional  
    public List<ProjectStaffPickDTO> getAllStaffPicks() {
        return repository.findAllByOrderBySlotIndex();
    }

    // 저장 or 수정
    @Transactional  
    public void saveOrUpdateStaffPickList(List<ProjectStaffPickDTO> picks) {
        for (ProjectStaffPickDTO pick : picks) {
            Optional<ProjectStaffPickDTO> existing = repository.findBySlotIndex(pick.getSlotIndex());
            if (existing.isPresent()) {
                ProjectStaffPickDTO old = existing.get();
                old.setProjectId(pick.getProjectId());
                repository.save(old);
            } else {
            	int maxId = repository.findMaxPickId();
            	pick.setPickId(maxId + 1);               // 수동 증가
                repository.save(pick); // userUuid 포함
            }
        }
    }

    // 삭제
    @Transactional  
    public void deleteStaffPickByProjectId(int projectId) {
        repository.deleteByProjectId(projectId);
    }
}
