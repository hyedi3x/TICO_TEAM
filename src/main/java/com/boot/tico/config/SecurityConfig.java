package com.boot.tico.config;

import javax.servlet.http.HttpServletResponse;  // 추가

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.firewall.HttpFirewall;
import org.springframework.security.web.firewall.StrictHttpFirewall;

import com.boot.tico.login.security.JwtAuthenticationFilter;
import com.boot.tico.login.security.OAuth2SuccessHandler;
import com.boot.tico.login.security.UserDetailsServiceImpl;

import static org.springframework.security.config.Customizer.withDefaults;
import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    // JWT 필터 주입 (AccessToken 검증 필터)
    private final JwtAuthenticationFilter jwtFilter;
    
    // Security 필터 체인 설정
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, OAuth2SuccessHandler successHandler) throws Exception {
        http
        		// CORS 설정 활성화
                .cors(withDefaults())
                // CSRF 비활성화 (JWT 기반 API 인증에 필요 없음)
                .csrf(csrf -> csrf.disable())
                // 폼 로그인 비활성화 (리다이렉트 제거)
                .formLogin(form -> form.disable())
                // HTTP Basic 인증 비활성화 (토큰 인증 방식 사용)
                .httpBasic(httpBasic -> httpBasic.disable())
                // 인증 실패 시 401 에러 반환 설정 추가 (설정안하면 비밀번호 잘못 입력시 302코드 반환하여 500 오류발생)
                .exceptionHandling(exceptionHandling -> exceptionHandling
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
                        })
                )
                // 요청 권한 설정
                .authorizeRequests(requests -> requests
                		// 인증 없이 접근 허용할 경로들 (이외의 요청은 인증 필요)

                        .antMatchers(
                            "/auth/test",
                            "/auth/**", 
                        		"/auth/login/employee**", 
                        		"/auth/login/customer**", 
                        		"/oauth2/**", 
                        		"/error", 
                        		"/project/**", 
                            "/projectComments/**",
                            "/favor/**", 
                        		"/api/**", 
                        		"/quiz/**",
                        		"/eduBlock/**", 
                        		"/uploads/**", 
                            "/ws-chat/**",
                            "/ws-chat",
                            "/banner/**",
                        		"/"
                        		).permitAll()
                        .anyRequest().authenticated())
                // 소셜 로그인 설정
                .oauth2Login(login -> login
                        // 로그인 성공 시 커스텀 SuccessHandler 실행 (JWT 발급 등 처리)
                        .successHandler(successHandler)
                        // 실패시 리디렉션
                        .failureUrl("/auth/login?error=true"));

        // UsernamePasswordAuthenticationFilter 앞에 JWT 필터 삽입
        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
   
    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider(UserDetailsServiceImpl userDetailsService, PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
    
    // 방화벽(Firewall) 설정 커스터마이징. 
    // 정적 파일 요청 URL에 슬래시(//)나 백슬래시(\)가 포함되어 있을 때 차단되지 않게 하려고 넣은 설정.
    @Bean
    public HttpFirewall allowUrlEncodedDoubleSlashFirewall() {
        StrictHttpFirewall firewall = new StrictHttpFirewall();		// StrictHttpFirewall: Spring Security가 사용하는 기본 방화벽. 기본 설정에서는 //,\,URL 인젝션 등을 막음.
        firewall.setAllowUrlEncodedDoubleSlash(true);				// %2F%2F처럼 인코딩된 이중 슬래시도 허용하겠다는 설정.
        firewall.setAllowBackSlash(true);							// 백슬래시 \를 URL에 포함해도 차단하지 않도록 설정
        return firewall;
    }

    // Spring Security에 위에 만든 HttpFirewall 설정을 등록하는 코드
    @Bean
    public WebSecurityCustomizer webSecurityCustomizer(HttpFirewall firewall) {
        return web -> web.httpFirewall(firewall);
    }
}
