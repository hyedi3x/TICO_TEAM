package com.boot.tico.user.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.boot.tico.login.entity.User;

import com.boot.tico.user.dto.UserDetailDTO;
import com.boot.tico.user.dto.UserListDTO;
import com.boot.tico.user.repository.UserListRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserInfoService {
	
	private final UserListRepository userRepo;

	// 검색 + 페이징
    public Page<UserListDTO> searchUsersByName(String keyword, Pageable pageable) {
        return userRepo.findByNameContainingIgnoreCase(keyword, pageable)
                       .map(user -> new UserListDTO(
                           user.getUser_uuid(),
                           user.getEmail(),
                           user.getName(),
                           user.getNickname(),
                           false // active 여부는 추후 로직 반영
                       ));
    }
    
    // 개별 회원 상세 정보 조회
    public UserDetailDTO getUserDetail(String uuid) {
        User user = userRepo.findById(uuid)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDetailDTO dto = new UserDetailDTO();
        dto.setUserUuid(user.getUser_uuid());
        dto.setEmail(user.getEmail());
        dto.setName(user.getName());
        dto.setNickname(user.getNickname());
        dto.setPhone(user.getPhone());
        dto.setProvider(user.getProvider());
        dto.setActive(false);               // TODO: 추후 연동
        dto.setSubscriptionType("basic");   // TODO
        dto.setProjectCount(0);             // TODO
        dto.setQuizCount(0);                // TODO
        dto.setCommunityActivity(0);        // TODO
        return dto;
    }
    
    // 회원정보 수정
    public void updateUser(String uuid, UserDetailDTO dto) {
        User user = userRepo.findById(uuid)
            .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(dto.getName());
        user.setNickname(dto.getNickname());
        user.setPhone(dto.getPhone());

        userRepo.save(user);
    }
    
}
