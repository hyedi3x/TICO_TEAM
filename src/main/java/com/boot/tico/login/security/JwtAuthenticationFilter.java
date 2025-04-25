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
import javax.servlet.http.Cookie;
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

        String token = resolveToken(request); // ✅ Header 또는 쿠키에서 토큰 추출

        if (StringUtils.hasText(token)) {
            try {
                Claims claims = jwtTokenizer.parseClaims(token);

                // ✅ email 또는 empId 중 하나 추출
                String principal = claims.containsKey("email")
                        ? claims.get("email", String.class)
                        : claims.get("empId", String.class);

                // ✅ userType이 존재한다면 요청에 강제 세팅
                if (request.getAttribute("userType") == null && claims.get("userType") != null) {
                    request.setAttribute("userType", claims.get("userType", String.class));
                    log.debug("JWT 필터에서 추출된 userType 강제 세팅: {}", claims.get("userType", String.class));
                }

                // ✅ 인증 정보가 없다면 SecurityContext에 저장
                if (principal != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    log.debug("JWT 필터에서 추출된 principal: {}", principal);
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(principal, null, Collections.emptyList());
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
     // 2) 없으면 쿠키에서 refreshToken 찾아보기
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("refreshToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}
