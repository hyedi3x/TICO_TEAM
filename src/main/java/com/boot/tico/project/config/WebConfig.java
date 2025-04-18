package com.boot.tico.project.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration //  해당 클래스가 스프링 설정 클래스임을 나타냄
public class WebConfig implements WebMvcConfigurer {
	
	// 정적 리소스 제공방식 지정
	@Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // URL 요청: /uploads/~~~  → 실제 폴더: D:/Git/TICO_TEAM/uploads/로 연동
		System.out.println("🧭 현재 작업 경로: " + System.getProperty("user.dir"));
		
		// 정적 자원 요청 URL → 실제 경로 매핑
        registry.addResourceHandler("/uploads/**") // 와일드카드 ** : **는 0개 이상의 디렉토리와 파일을 매칭
                .addResourceLocations("file:" + System.getProperty("user.dir") + "/uploads/");
        		// "file:" 접두사는 로컬 파일 시스템에서 파일을 찾겠다는 의미
    }  
}