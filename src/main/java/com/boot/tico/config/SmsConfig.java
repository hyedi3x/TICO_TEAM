package com.boot.tico.config;

import lombok.Getter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Configuration
@ConfigurationProperties("coolsms.api")
public class SmsConfig {
    private String key;
    private String secret;

    public void setKey(String key)     { this.key = key; }
    public void setSecret(String secret) { this.secret = secret; }
}
