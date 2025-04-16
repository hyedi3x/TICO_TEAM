package com.boot.tico.project.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.boot.tico.project.dto.ProjectFavorDTO;
import com.boot.tico.project.repo.ProjectFavorRepository;
import com.boot.tico.project.repo.ProjectRepository;

@Service
public class ProjectFavorService {

	@Autowired
	private ProjectFavorRepository favorRepository;
	
	@Autowired
	private ProjectRepository projectRepository;
	
	 /**
     * [1] 좋아요/북마크 토글 기능
     */
    @Transactional
    public void toggleFavor(ProjectFavorDTO dto) {
        boolean exists = hasFavor(dto.getProjectId(), dto.getUserUuid(), dto.getFavorType());

        if (exists) {
            // 이미 눌렀으면 삭제
            favorRepository.deleteFavor(dto.getProjectId(), dto.getUserUuid(), dto.getFavorType());
        } else {
            // 안 눌렀으면 추가
            ProjectFavorDTO favor = new ProjectFavorDTO();
            favor.setFavorId(favorRepository.getLatestFavorId() + 1); // 수동 ID 설정
            favor.setProjectId(dto.getProjectId());
            favor.setUserUuid(dto.getUserUuid());
            favor.setFavorType(dto.getFavorType());

            favorRepository.save(favor);
            if (dto.getFavorType().equals("like")) {
            	projectRepository.updateLikeCount(dto.getProjectId());
            } else if (dto.getFavorType().equals("bookmark")) {
            	projectRepository.updateBookmarkCount(dto.getProjectId());
            }
        }
    }

    /**
     * [2] 유저가 이미 해당 프로젝트에 좋아요 or 북마크 눌렀는지 여부 확인
     */
    public boolean hasFavor(int projectId, String userUuid, String favorType) {
        return favorRepository.countFavor(projectId, userUuid, favorType) > 0;
    }

}
