package com.boot.tico.user.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.boot.tico.user.dto.UserDetailDTO;
import com.boot.tico.user.dto.UserListDTO;
import com.boot.tico.user.service.UserInfoService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
	
	private final UserInfoService service;
    
    // 검색 + 페이징 기능
    @GetMapping("/search")
    public ResponseEntity<?> searchUsersByName(
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            Pageable pageable = PageRequest.of(page - 1, size); // 0-based page index
            Page<UserListDTO> results = service.searchUsersByName(keyword, pageable);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("회원 검색 중 오류 발생");
        }
    }

    // 회원 상세 조회
    @GetMapping("/{uuid}")
    public ResponseEntity<?> getUserDetail(@PathVariable String uuid) {
        try {
            UserDetailDTO detail = service.getUserDetail(uuid);
            return ResponseEntity.ok(detail); // 200 OK
        } catch (RuntimeException e) {
            return ResponseEntity
                .status(404)
                .body("해당 유저를 찾을 수 없습니다: " + uuid);
        } catch (Exception e) {
            return ResponseEntity
                .status(500)
                .body("서버 내부 오류가 발생했습니다.");
        }
    }
    
    // 회원 정보 수정
    @PutMapping("/{uuid}")
    public ResponseEntity<?> updateUserInfo(@PathVariable String uuid, @RequestBody UserDetailDTO dto) {
        try {
        	service.updateUser(uuid, dto);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("회원 정보 수정 실패");
        }
    }

}
