package com.boot.tico.login.service;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class VerificationCodeService {
    // 실제 운영 시 Redis나 DB 기반으로 유효시간 등 관리 필요
    private Map<String, String> codeMap = new ConcurrentHashMap<>();

    public String generateCode(String email) {
        String code = String.format("%06d", (int)(Math.random() * 1000000));
        codeMap.put(email, code);
        return code;
    }

    public boolean verifyCode(String email, String code) {
        String storedCode = codeMap.get(email);
        if (storedCode != null && storedCode.equals(code)) {
            codeMap.remove(email);
            return true;
        }
        return false;
    }
}
