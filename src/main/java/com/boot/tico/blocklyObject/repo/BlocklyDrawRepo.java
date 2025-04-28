package com.boot.tico.blocklyObject.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.boot.tico.blocklyObject.dto.BlocklyDraw;

public interface BlocklyDrawRepo extends JpaRepository<BlocklyDraw, String>{
	// 특정 사용자가 그린 것만 가져오기
    List<BlocklyDraw> findByUserUuid(String userUuid);
}
