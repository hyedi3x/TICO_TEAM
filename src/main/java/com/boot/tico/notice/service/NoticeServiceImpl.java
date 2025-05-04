package com.boot.tico.notice.service;

import java.util.List;
import java.util.Optional;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.boot.tico.notice.dto.NoticeDTO;
import com.boot.tico.notice.repository.NoticeRepository;

@Service
public class NoticeServiceImpl {
	
	@Autowired
	private NoticeRepository repo;
		
	// 전체 반환
	@Transactional
	public List<NoticeDTO> getNotice(){
		return repo.findAll();
	}
	@Transactional
	public Optional<NoticeDTO> getNoticeDetail(Integer noticeId){
		return repo.findById(noticeId);
	}
	@Transactional
	public String noticeView(Integer noticeId) {
		Optional<NoticeDTO> dto = repo.findById(noticeId);
		if (dto.isPresent()) {
	        NoticeDTO notice = dto.get();
	        notice.setVisitLength(notice.getVisitLength() + 1);
	        repo.save(notice); // ✅ 수정한 내용을 다시 저장해줘야 한다.
	        return "성공";
	    } else {
	        return "해당 공지사항이 없습니다.";
	    }
	}
	@Transactional
	public void saveNotice(NoticeDTO noticeDTO) {
		Integer maxId = repo.findMaxNoticeId();
	    if (maxId == null) {
	        maxId = 0;
	    }
	    noticeDTO.setNoticeId(maxId + 1);

	    repo.save(noticeDTO);
	}
	
	// 공지 삭제 (showFlag = 'N')
	@Transactional
	public void deleteNotice(Integer noticeId) {
	    Optional<NoticeDTO> dto = repo.findById(noticeId);
	    if (dto.isPresent()) {
	        NoticeDTO notice = dto.get();
	        notice.setShowFlag("N");
	        repo.save(notice); // ✅ 수정해서 저장
	    }
	}

	// 공지 삭제 취소 (showFlag = 'Y')
	@Transactional
	public void restoreNotice(Integer noticeId) {
	    Optional<NoticeDTO> dto = repo.findById(noticeId);
	    if (dto.isPresent()) {
	        NoticeDTO notice = dto.get();
	        notice.setShowFlag("Y");
	        repo.save(notice); // ✅ 수정해서 저장
	    }
	}

	// 공지 영구 삭제 (DB 완전 삭제)
	@Transactional
	public void permanentDeleteNotice(Integer noticeId) {
	    repo.deleteById(noticeId); // ✅ 완전히 삭제
	}
	
	// 공지 수정
	@Transactional
	public void updateNotice(Integer noticeId, NoticeDTO updatedDTO) {
	    Optional<NoticeDTO> optionalNotice = repo.findById(noticeId);
	    if (optionalNotice.isPresent()) {
	        NoticeDTO existingNotice = optionalNotice.get();
	        existingNotice.setTitle(updatedDTO.getTitle());
	        existingNotice.setType(updatedDTO.getType());
	        existingNotice.setContent(updatedDTO.getContent());
	        existingNotice.setModifyId(updatedDTO.getModifyId());
	        repo.save(existingNotice); // ✅ 수정된 내용 저장
	    } else {
	        throw new IllegalArgumentException("공지사항을 찾을 수 없습니다. ID: " + noticeId);
	    }
	}
}
