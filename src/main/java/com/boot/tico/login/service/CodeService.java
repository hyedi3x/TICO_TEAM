package com.boot.tico.login.service;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CodeService {

    private final Map<String, String> map = new ConcurrentHashMap<>();

    /** key(email or phone)로 6자리 코드 생성 */
    public String gen(String key) {
        String code = String.format("%06d", (int)(Math.random() * 1_000_000));
        map.put(key, code);
        return code;
    }

    /** 입력한 코드가 저장된 코드와 일치하면 삭제 후 true */
    public boolean verify(String key, String code) {
        String saved = map.get(key);
        if (saved != null && saved.equals(code)) {
            map.remove(key);
            return true;
        }
        return false;
    }
}

