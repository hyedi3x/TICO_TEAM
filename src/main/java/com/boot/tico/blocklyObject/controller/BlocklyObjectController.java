package com.boot.tico.blocklyObject.controller;

import java.util.List;

import com.boot.tico.blocklyObject.dto.BlocklyObject;
import com.boot.tico.blocklyObject.service.BlocklyObjectService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/blockly-objects")
public class BlocklyObjectController {

    @Autowired
    private BlocklyObjectService service;

    // 전체 오브젝트 목록 조회 
    //모든 오브젝트 정보 DB에서 조회하여 JSON형식으로 반환.
    @GetMapping
    public List<BlocklyObject> getAllObjects() {
        return service.getAllObjects();
    }

    // 카테고리별 오브젝트 조회(아직 안씀)
    // 해당 카테고리에 속하는 오브젝트 목록
    @GetMapping("/category/{category}")
    public List<BlocklyObject> getByCategory(@PathVariable String category) {
        return service.getObjectsByCategory(category);
    }

    // 오브젝트 단건 조회(아직 안씀)
    // 해당 오브젝트 정보 반환 (없으면 null)
    @GetMapping("/{id}")
    public BlocklyObject getById(@PathVariable Long id) {
        return service.getById(id);
    }
    
    // 오브젝트 등록(관리자)
    @PostMapping("/upload-object")
    public ResponseEntity<String> uploadObject(
    		@RequestParam("file") MultipartFile file,
    	    @RequestParam("user_uuid") String userUuid,
    	    @RequestParam("name") String name,
    	    @RequestParam("category") String category,
    	    @RequestParam("description") String description,
    		@RequestParam("blocklyObjectPoint") Boolean isPaid) {	// boolean은 파싱 실패 시 400에러 발생, Boolean은 null허용. 안정성을 위해 Boolean 권장.
        try {
        	service.saveUploadedObject(file, userUuid, category, name, description, isPaid);
            return ResponseEntity.ok("success");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("error: " + e.getMessage());
        }
    }

    // 오브젝트 수정(관리자)
    @PutMapping("/update-object")
    public ResponseEntity<String> updateObjectWithImage(
            @RequestParam("id") Long id,
            @RequestParam("name") String name,
            @RequestParam("category") String category,
            @RequestParam("description") String description,
            @RequestParam(value = "file", required = false) MultipartFile file,	//새로운 이미지 파일
            @RequestParam("user_uuid") String userUuid,
            @RequestParam("blocklyObjectPoint") Boolean isPaid) {
        try {
            service.updateObject(id, name, category, description, file, userUuid, isPaid);
            return ResponseEntity.ok("수정 성공");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("수정 실패: " + e.getMessage());
        }
    }

    // 오브젝트 단일 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteObject(@PathVariable Long id) {
        service.deleteObject(id);
        return ResponseEntity.ok("삭제 성공");
    }
    
    // 오브젝트 다중 삭제
    @DeleteMapping("/delete-multiple")
    public ResponseEntity<?> deleteMultipleObjects(@RequestBody List<Long> ids) {		// 삭제할 오브젝트 ID 리스트 (JSON 배열)
        try {
        	service.deleteMultipleObjects(ids);
            return ResponseEntity.ok("삭제 완료");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            		.body("삭제 실패: " + e.getMessage());
        }
    }
}
