package com.boot.tico.notice.controller;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.boot.tico.notice.service.NoticeServiceImpl;

@RestController
@RequestMapping("/api")
public class NoticeController {
	
	@Autowired
	private NoticeServiceImpl noticeService;
	
	private final Logger logger = LoggerFactory.getLogger(NoticeController.class);
	
	@GetMapping("/noticeGet")
	public ResponseEntity<?> getNotice(){
		logger.info("<<< url => getNotice >>> ");
		return new ResponseEntity<>(noticeService.getNotice(), HttpStatus.CREATED);
	}
	@GetMapping("/noticeDetailGet")
	public ResponseEntity<?> getNoticeDetail(){
		logger.info("<<< url => getNotice >>> ");
		return new ResponseEntity<>(noticeService.getNoticeDetail(), HttpStatus.CREATED);
	}
}
