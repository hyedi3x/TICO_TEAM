package com.boot.tico.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
//회원 목록에서 사용하는 간단한 리스트
public class UserListDTO {
	private String userUuid;
	private String email;
	private String name;
	private String nickname;
	private boolean active;         // 이용권 여부
	
}
