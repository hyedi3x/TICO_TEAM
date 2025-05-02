package com.boot.tico;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync  // 비동기 처리를 활성화합니다.
@EnableScheduling // 스케줄링 처리 활성화
public class TicoTeamApplication {

	public static void main(String[] args) {
		SpringApplication.run(TicoTeamApplication.class, args);
	}

}
