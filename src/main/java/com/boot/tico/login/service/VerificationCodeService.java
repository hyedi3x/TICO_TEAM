package com.boot.tico.login.service;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class VerificationCodeService {
    // 실제 운영 시 Redis나 DB 기반으로 유효시간 등 관리 필요
	// 랜덤 코드 생성
    private Map<String, String> codeMap = new ConcurrentHashMap<>();

    public String generateCode(String email) { // generateCode : 인증번호를 만들어 이메일로 보내는 역할
        String code = String.format("%06d", (int)(Math.random() * 1000000));
        codeMap.put(email, code); // 생성한 랜덤코드를 메모리에 저장
        return code;
    }
    
    // 사용자 입력한 랜덤코드와 실제 발급 코드 일치여부 확인
    public boolean verifyCode(String email, String code) { // verifyCode : 인증번호 확인하는 역할
        String storedCode = codeMap.get(email); // 저장된 인증코드 추출
        if (storedCode != null && storedCode.equals(code)) {
            codeMap.remove(email); // 일회용 인증코드로 일치하면 삭제
            return true;
        }
        return false;
    }
}
