package com.boot.tico.project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.boot.tico.project.dto.ProjectFavorDTO;
import com.boot.tico.project.service.ProjectFavorService;

@RestController
@RequestMapping("/favor")
public class ProjectFavorController {

	@Autowired
	private ProjectFavorService favorService;
	
	/**
     * [POST] 좋아요 or 북마크 토글 요청
     * → 누르지 않았으면 추가, 누른 상태면 삭제
     */
    @PostMapping("/toggle")
    public void toggleFavor(@RequestBody ProjectFavorDTO dto) {
        favorService.toggleFavor(dto);
    }

    /**
     * [GET] 현재 로그인 유저가 해당 프로젝트에 좋아요/북마크 눌렀는지 확인
     * → 프론트에서 버튼 초기 상태 결정용
     */
    @GetMapping("/status")
    public boolean hasFavor(
            @RequestParam int projectId,
            @RequestParam String userUuid,
            @RequestParam String type
    ) {
        return favorService.hasFavor(projectId, userUuid, type);
    }
}
