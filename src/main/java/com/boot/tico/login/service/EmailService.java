package com.boot.tico.login.service;

import lombok.extern.slf4j.Slf4j;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;


// pom.xml에 의존성 추가필요함 ★★★★★★★★★★★★


@Slf4j
@Service
public class EmailService {

    // JavaMailSender 빈은 Spring Boot에서 자동 구성되므로, yml 설정이 올바르면 주입됩니다.
    private final JavaMailSender mailSender;
    
    // 생성자 주입을 통해 JavaMailSender 빈 주입
    public EmailService(JavaMailSender mailSender) {
    	this.mailSender = mailSender;
    }
    
    /**
     * 지정된 수신자(to)에게 제목(subject)과 본문(text)의 이메일을 전송합니다.
     *
     * @param to      수신자 이메일 주소
     * @param subject 이메일 제목
     * @param text    이메일 본문 내용
     * @throws RuntimeException 메일 발송이 실패하면 RuntimeException을 던집니다.
     */
    
    
    @Async // 비동기화 활성화
    public void sendMail(String to, String subject, String text) {
        try {
            // SimpleMailMessage는 간단한 텍스트 메시지를 위한 클래스입니다.
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            
            // 메일 발송
            mailSender.send(message);
            
            log.info("메일 발송 성공: to={}, subject={}", to, subject);
        } catch (Exception ex) {
            log.error("메일 발송 실패: ", ex);
            // 필요에 따라 적절한 예외 처리 또는 사용자에게 메시지를 전달할 수 있음
            throw new RuntimeException("메일 발송에 실패했습니다.", ex);
        }
    }
    
    /**
     * 비밀번호 재설정을 위한 이메일을 전송합니다.
     * 이메일 제목과 본문을 직접 구성하여 수신자에게 전송합니다.
     *
     * @param to         수신자 이메일 주소
     * @param resetLink  비밀번호 재설정을 위한 링크 또는 인증 코드
     */
    
    @Async // 비동기화 활성화
    public void sendPasswordResetMail(String to, String resetLink) {
        String subject = "비밀번호 재설정 안내";
        String text = "안녕하세요.\n\n" +
                      "아래 링크를 클릭하여 비밀번호 재설정을 진행해주세요.\n" +
                      resetLink + "\n\n" +
                      "해당 링크는 일정 시간이 지나면 만료됩니다.\n" +
                      "감사합니다.";
        
        // 위에서 구성한 제목과 본문을 사용하여 메일 전송
        sendMail(to, subject, text);
    }
}

