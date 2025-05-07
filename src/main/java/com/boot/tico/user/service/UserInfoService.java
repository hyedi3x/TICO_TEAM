package com.boot.tico.user.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.boot.tico.login.entity.User;
import com.boot.tico.project.repo.ProjectRepository;
import com.boot.tico.purchase.dto.Purchase;
import com.boot.tico.purchase.repo.PurchaseRepo;
import com.boot.tico.quiz.dao.SolvedRepository;
import com.boot.tico.user.dto.UserDetailDTO;
import com.boot.tico.user.dto.UserListDTO;
import com.boot.tico.user.repository.UserListRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserInfoService {
	
	private final UserListRepository userRepo;
	private final PurchaseRepo purchaseRepo;
    private final ProjectRepository projectRepo;
    private final SolvedRepository solvedRepo;
    
	// 회원 목록 (검색 + 페이징)
    public Page<UserListDTO> searchUsersByName(String keyword, Pageable pageable) {
        return userRepo.findByNameContainingIgnoreCase(keyword, pageable)
                       .map(user -> {
                       	boolean isActive = purchaseRepo.findById(user.getUser_uuid())
                       						.map(Purchase::isActive)
                       						.orElse(false);
                       return new UserListDTO(
                           user.getUser_uuid(),
                           user.getEmail(),
                           user.getName(),
                           user.getNickname(),
                           isActive
                           );
                       });
    }
    
    // 개별 회원 상세 정보 조회
    public UserDetailDTO getUserDetail(String uuid) {
        User user = userRepo.findById(uuid)
                .orElseThrow(() -> new RuntimeException("User not found"));
    
        Purchase purchase = purchaseRepo.findById(uuid).orElse(null);
    
        UserDetailDTO dto = new UserDetailDTO();
        dto.setUserUuid(user.getUser_uuid());
        dto.setEmail(user.getEmail());
        dto.setName(user.getName());
        dto.setNickname(user.getNickname());
        dto.setPhone(user.getPhone());
        dto.setProvider(user.getProvider());
    
        if (purchase != null) {
            dto.setActive(purchase.isActive());
            dto.setSubscriptionType(purchase.getSubscriptionType());
        } else {
            dto.setActive(false);
            dto.setSubscriptionType("basic");
        }
    
        // 통계 항목 쿼리 추가
        int projectCount = projectRepo.countPublicProjectsByUserUuid(uuid); // 공개된 작품 수
        int quizCount = solvedRepo.countSolvedQuizzesByUserUuid(uuid);      // 푼 퀴즈 수
        int communityActivity = projectRepo.sumCommunityActivity(uuid);     // 커뮤니티 활동 수        
    
        dto.setProjectCount(projectCount);
        dto.setQuizCount(quizCount);
        dto.setCommunityActivity(communityActivity);
    
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
