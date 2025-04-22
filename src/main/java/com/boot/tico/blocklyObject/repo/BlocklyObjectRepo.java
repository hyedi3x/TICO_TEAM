package com.boot.tico.blocklyObject.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.boot.tico.blocklyObject.dto.BlocklyObject;

@Repository
public interface BlocklyObjectRepo extends JpaRepository<BlocklyObject, Long>{	// JpaRepository<엔티티, ID 타입>을 상속받음.
	List<BlocklyObject> findByBlocklyObjectCategory(String category);

}
