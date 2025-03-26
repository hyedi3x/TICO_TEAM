// config/CorsConfig.java
package com.boot.tico.login.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;


// cors 설정
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // 모든경로에 cors 설정
                .allowedOrigins("http://localhost:3000") // react에서 주소 허용
                .allowedMethods("GET", "POST", "PUT", "DELETE") // 허용할 http 메서드 지정
                .allowedHeaders("*") // 모든 헤더 허용
                .allowCredentials(true); // 쿠키,자격증명 허용
    }
}