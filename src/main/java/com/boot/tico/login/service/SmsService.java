package com.boot.tico.login.service;


import lombok.RequiredArgsConstructor;
import net.nurigo.sdk.NurigoApp;
import net.nurigo.sdk.message.exception.NurigoEmptyResponseException;
import net.nurigo.sdk.message.exception.NurigoMessageNotReceivedException;
import net.nurigo.sdk.message.exception.NurigoUnknownException;
import net.nurigo.sdk.message.model.Message;
import net.nurigo.sdk.message.service.DefaultMessageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.boot.tico.config.SmsConfig;

import javax.annotation.PostConstruct;

@Service
@RequiredArgsConstructor
public class SmsService {

    private final SmsConfig config;

    @Value("${coolsms.from}")
    private String from;

    private DefaultMessageService client;

    @PostConstruct
    public void init() {
        client = NurigoApp.INSTANCE.initialize(
            config.getKey(),
            config.getSecret(),
            "https://api.coolsms.co.kr"
        );
    }

    public void send(String to, String text) {
        Message m = new Message();
        m.setFrom(from);
        m.setTo(to);
        m.setText(text);
        try {
            client.send(m);
        } catch (NurigoEmptyResponseException
               | NurigoMessageNotReceivedException
               | NurigoUnknownException e) {
            // 원하는 대로 로깅 or 재시도 or 예외 전환
            throw new RuntimeException("SMS 전송 중 예외 발생", e);
        }
    }
}    