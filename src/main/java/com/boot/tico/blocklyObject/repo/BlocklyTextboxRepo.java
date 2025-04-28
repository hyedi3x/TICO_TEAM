package com.boot.tico.blocklyObject.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.boot.tico.blocklyObject.dto.BlocklyTextbox;

public interface BlocklyTextboxRepo extends JpaRepository<BlocklyTextbox, String> {
    List<BlocklyTextbox> findByUserUuid(String userUuid);
}
