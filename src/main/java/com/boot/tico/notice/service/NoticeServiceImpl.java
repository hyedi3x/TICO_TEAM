package com.boot.tico.notice.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.boot.tico.notice.dto.NoticeDTO;
import com.boot.tico.notice.repository.NoticeRepository;

@Service
public class NoticeServiceImpl {
	
	@Autowired
	private NoticeRepository repo;
	
	public List<NoticeDTO> getNotice(){
		return repo.findAll();
	}
	public Map<String, String> getNoticeDetail(){
		return null;
	}
}
