package com.boot.tico.faq.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.boot.tico.faq.dto.FAQDTO;
import com.boot.tico.faq.service.FAQServiceImpl;
import com.boot.tico.project.controller.ProjectController;

@RestController //Controller + ResponseBody (Java 객체를 JSON이나 XML과 같은 형식으로 변환하여 응답 본문에 작성)
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class FAQContoroller {
	
	@Autowired
    private FAQServiceImpl faqService;
	
	private final Logger logger = LoggerFactory.getLogger(FAQContoroller.class);
	
	 @PostMapping("/faqPost") // Post 요청이 /faqPost 경로로 들어올 때 실행
	    public ResponseEntity<?> postFAQ(@RequestBody FAQDTO dto) {
		 // @RequestBody : HTTP 요청의 본문(request body)에 담긴 데이터를 Java 객체로 변환하는 데 사용
		 	System.out.println("<<< board >>>");
		 	return new ResponseEntity<>(faqService.save(dto), HttpStatus.OK);
		 								// 응답 본문 (body) , 응답 상태
	    }
	 
	 @GetMapping("/faqGet") 
	    public ResponseEntity<?> getFAQ() {
		 	logger.info("<<< url => faqGet >>>");
		 	return new ResponseEntity<>(faqService.findAll(), HttpStatus.CREATED);
	    }
	 
	 @DeleteMapping("/faqDelete/{faq_id}") 
	    public ResponseEntity<?> deleteFAQ(@PathVariable int faq_id) {
		 	System.out.println("<<< board Delete >>>");
		 	return new ResponseEntity<>(faqService.delete(faq_id), HttpStatus.OK);
		 								
	    }
	 
	 @GetMapping("/faqGetbyId/{faq_id}") 
	    public ResponseEntity<?> getFAQ(@PathVariable int faq_id) {
		 	System.out.println("<<< board >>>");
		 	return new ResponseEntity<>(faqService.findById(faq_id), HttpStatus.CREATED);
		 
	    }
	 
	 @PutMapping("/faqPut/{faq_id}") 
	    public ResponseEntity<?> putFAQ(@PathVariable int faq_id, @RequestBody FAQDTO dto) {	 
		 	System.out.println("<<< board >>>");
		 	return new ResponseEntity<>(faqService.put(faq_id, dto), HttpStatus.OK);
		 								
	    }
	 
	 
}
