package com.boot.tico.login.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenizer jwtTokenizer;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        log.info("JwtAuthenticationFilter 실행됨 - 요청 URI: {}", request.getRequestURI());
        
        String token = resolveToken(request);

        if (StringUtils.hasText(token)) {
            try {
                Claims claims = jwtTokenizer.parseClaims(token);
                // 우선 email 클레임이 있는지 먼저 확인하고, 없으면 empId 클레임 사용
                String principal;
                if(claims.containsKey("email")) {
                	principal = claims.get("email", String.class);
                } else if(claims.containsKey("empId")) {
                	principal = claims.get("empId", String.class);
                } else {
                	principal = null;
                }
                
                log.debug("토큰에서 추출된 이메일: {}", principal);

                if (principal != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    log.debug("JWT 필터에서 추출한 이메일: {}", principal); 
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    		principal, null, Collections.emptyList());
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (ExpiredJwtException e) {
                log.warn("JWT 토큰 만료됨: {}", e.getMessage());
            } catch (JwtException e) {
                log.warn("JWT 검증 실패: {}", e.getMessage());
            } catch (Exception e) {
                log.error("JWT 필터 예외 발생: {}", e.getMessage(), e);
            }
        }

        filterChain.doFilter(request, response);
    }
    
    // Authorization 헤더에서 Bearer 토큰 추출
    private String resolveToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (StringUtils.hasText(bearer) && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }
}
