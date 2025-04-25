package com.boot.tico.project.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.boot.tico.project.dto.ProjectStaffPickDTO;
import com.boot.tico.project.service.ProjectStaffPickService;

@RestController
@RequestMapping("/api/project")
public class ProjectStaffPickController {
	@Autowired
	private ProjectStaffPickService service;
	
	private final Logger logger = LoggerFactory.getLogger(ProjectStaffPickController.class);
	
	 @GetMapping("/staffPick")
	    public ResponseEntity<List<ProjectStaffPickDTO>> getStaffPickList() {
	        logger.info("<<< url => /staffPick (GET) >>>");
	        List<ProjectStaffPickDTO> picks = service.getAllStaffPicks();
	        return ResponseEntity.ok(picks);
	    }

	    // ✅ 2. 스태프 선정 저장 (등록 or 수정)
	    @PostMapping("/staffPick")
	    public ResponseEntity<Void> saveStaffPickList(@RequestBody List<ProjectStaffPickDTO> pickList) {
	        logger.info("<<< url => /staffPick (POST) >>>");
	        service.saveOrUpdateStaffPickList(pickList);
	        return ResponseEntity.ok().build();
	    }

	    // ✅ 3. 스태프 선정 삭제
	    @DeleteMapping("/staffPick/{slotIndex}")
	    public ResponseEntity<Void> deleteStaffPick(@PathVariable int slotIndex) {
	        logger.info("<<< url => /staffPick/{} (DELETE) >>>", slotIndex);
	        service.deleteStaffPickBySlotIndex(slotIndex);
	        return ResponseEntity.ok().build();
	    }
	    
}
