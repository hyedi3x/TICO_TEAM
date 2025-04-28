package com.boot.tico.blocklyObject.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.boot.tico.blocklyObject.dto.BlocklyUploadFile;

public interface BlocklyUploadFileRepo extends JpaRepository<BlocklyUploadFile, String>{
	 List<BlocklyUploadFile> findByUserUuid(String userUuid);
}
