package com.boot.tico.notice.controller;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.boot.tico.notice.dto.NoticeDTO;
import com.boot.tico.notice.service.NoticeService;

@RestController
@RequestMapping("/api")
public class NoticeController {
	
	@Autowired
	private NoticeService noticeService;
	
	private final Logger logger = LoggerFactory.getLogger(NoticeController.class);
	//공지 목록
	@GetMapping("/noticeGet")
	public ResponseEntity<?> getNotice(){
		logger.info("<<< url => getNotice >>> ");
		return new ResponseEntity<>(noticeService.getNotice(), HttpStatus.CREATED);
	}
	// 상세 조회
	@GetMapping("/noticeDetailGet/{noticeId}")
	public ResponseEntity<?> getNoticeDetail(@PathVariable("noticeId") Integer noticeId){
		logger.info("<<< url => getNotice >>> ");
		return new ResponseEntity<>(noticeService.getNoticeDetail(noticeId), HttpStatus.CREATED);
	}
	// 조회수 증가
	@PutMapping("/noticeView/{noticeId}")
	public ResponseEntity<?> noticeView(@PathVariable("noticeId") Integer noticeId){
		logger.info("<<< url => noticeView >>> ");
		return new ResponseEntity<>(noticeService.noticeView(noticeId), HttpStatus.CREATED);
	}
	// 공지 등록
	@PostMapping("/noticePost")
	public ResponseEntity<?> postNotice(@RequestBody NoticeDTO noticeDTO) {
	    logger.info("<<< url => noticePost >>> ");
	    noticeService.saveNotice(noticeDTO);
	    return new ResponseEntity<>("공지 등록 완료", HttpStatus.CREATED);
	}
	// 공지 삭제 (showFlag = 'N')
	@PutMapping("/noticeDelete/{noticeId}")
	public ResponseEntity<?> deleteNotice(@PathVariable("noticeId") Integer noticeId) {
	    logger.info("<<< url => noticeDelete >>> ");
	    noticeService.deleteNotice(noticeId);
	    return new ResponseEntity<>("공지 삭제 완료", HttpStatus.OK);
	}

	// 공지 삭제 취소 (showFlag = 'Y')
	@PutMapping("/noticeRestore/{noticeId}")
	public ResponseEntity<?> restoreNotice(@PathVariable("noticeId") Integer noticeId) {
	    logger.info("<<< url => noticeRestore >>> ");
	    noticeService.restoreNotice(noticeId);
	    return new ResponseEntity<>("공지 삭제 취소 완료", HttpStatus.OK);
	}

	// 공지 영구 삭제 (DB 완전 삭제)
	@DeleteMapping("/noticePermanentDelete/{noticeId}")
	public ResponseEntity<?> permanentDeleteNotice(@PathVariable("noticeId") Integer noticeId) {
	    logger.info("<<< url => noticePermanentDelete >>> ");
	    noticeService.permanentDeleteNotice(noticeId);
	    return new ResponseEntity<>("공지 영구 삭제 완료", HttpStatus.OK);
	}
	
	// 공지 수정
	@PutMapping("/noticePut/{noticeId}")
	public ResponseEntity<?> updateNotice(@PathVariable("noticeId") Integer noticeId, @RequestBody NoticeDTO noticeDTO) {
	    logger.info("<<< url => noticePut >>> ");
	    noticeService.updateNotice(noticeId, noticeDTO);
	    return new ResponseEntity<>("공지 수정 완료", HttpStatus.OK);
	}
}
