package com.boot.tico.login.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

@Component
public class JwtTokenizer {
	
	// application.yml에 있는 설정값을 불러오는 역할
    @Value("${jwt.secret-key}")
    private String secretKey;

    @Value("${jwt.access-token-expiration}")
    private long accessTokenExpiration; // 액세스 토큰의 만료 시간 (yml에 설정되어 있음)

    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpiration; // 리프레시 토큰 만료시간 (yml에 설정되어 있음)
    
    public long getRefreshTokenExpiration() {
        return refreshTokenExpiration;
    }
    
    // 액세스 토큰 생성
    public String generateAccessToken(Map<String, Object> claims) { // 토큰에 담을 사용자 정보 (email,userType)
        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(new Date()) // 토큰 발급 시간
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenExpiration)) // 만료 시간 설정
                .signWith(getSecretKey()) // 비밀키로 암호화
                .compact();
    }
    
    // claims는 일반 변수지만 jwt안에 들어가면 암호화된 사용자 정보가 된다라고 이해하면 이해하기 쉬움
    
    // 리프레시 토큰 생성 (토큰 재발급)
    public String generateRefreshToken(Map<String, Object> claims) {
    	String subject = claims.get("email") != null ? (String) claims.get("email") : (String) claims.get("empId");
        return Jwts.builder()
        		.setSubject(subject)
        		.setClaims(claims)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenExpiration))
                .signWith(getSecretKey())
                .compact();
    }
    
    // 토큰에서 Claims 추출
    public Claims parseClaims(String token) { // 클라이언트가 보낸 jwt를 해석해서 그 안에 들어있는 사용자 정보를 꺼냄
        return Jwts.parserBuilder()
                .setSigningKey(getSecretKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    
    // SecretKey 생성
    private SecretKey getSecretKey() { // 문자열 형태의 secretKey를 실제 암호화에 사용 할 수 있는 SecretKey 객체로 변환함
        byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
        // Keys.hmacShaKeyFor() 안전한 HMAC SHA 알고리즘 기반의 함호화 키 생성
    }
}
