package com.boot.tico.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        config.setAllowCredentials(true); // 쿠키/세션 사용 시 필요
        
        config.addAllowedOrigin("http://43.202.174.19:3000"); // 프론트엔드 주소
        
        config.addAllowedHeader("*"); // 모든 헤더 허용
        
        config.addAllowedMethod("*"); // 모든 HTTP 메서드 허용
        
        source.registerCorsConfiguration("/**", config); // 모든 경로에 적용
        
        return new CorsFilter(source);
    }
}



// CORS 설정 (CorsConfig)
// http://localhost:3000에서 오는 요청을 허용.
// 모든 헤더 및 메서드를 허용