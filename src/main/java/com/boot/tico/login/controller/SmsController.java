package com.boot.tico.login.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.boot.tico.login.service.CodeService;
import com.boot.tico.login.service.SmsService;

@RestController
@RequestMapping("/api/sms")
@RequiredArgsConstructor
public class SmsController {

    private final SmsService smsService;
    private final CodeService codeService;

    /** 문자로 인증번호 전송 */
    @PostMapping("/send")
    public ResponseEntity<String> send(@RequestParam String phone) {
        String code = codeService.gen(phone);
        smsService.send(phone, "[TICO] 인증번호: " + code);
        return ResponseEntity.ok("문자 전송 완료");
    }

    /** 사용자 입력 코드 검증 */
    @PostMapping("/verify")
    public ResponseEntity<String> verify(@RequestParam String phone,
                                         @RequestParam String code) {
        return codeService.verify(phone, code)
            ? ResponseEntity.ok("인증 성공")
            : ResponseEntity.badRequest().body("인증 실패");
    }
}
