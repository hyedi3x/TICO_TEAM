package com.boot.tico.user.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
// 회원 목록 상세페이지에서 보여줄 유저 정보
public class UserDetailDTO {
	private String userUuid;
	private String email;
	private String name;
	private String nickname;
	private String phone;
	private String provider;

	// 통계 항목
	private boolean active;         // 이용권 여부
	private String subscriptionType;
	private int projectCount;
	private int quizCount;
	private int communityActivity;  // 예: 게시글 + 댓글 수
}
