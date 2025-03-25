package com.boot.tico.login.service;


import com.boot.tico.login.config.KakaoProperties;
import com.boot.tico.login.dto.AccessTokenResponse;
import com.boot.tico.login.dto.KakaoUserInfo;
import com.boot.tico.login.entity.User;
import com.boot.tico.login.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class KakaoLoginService {

private final UserRepository userRepository;
private final KakaoProperties kakaoProperties;
private static final Logger logger = LoggerFactory.getLogger(KakaoLoginService.class);

@Autowired
public KakaoLoginService(UserRepository userRepository, KakaoProperties kakaoProperties) {
    this.userRepository = userRepository;
    this.kakaoProperties = kakaoProperties;
}

 
// 로그인(Login)
public Map<String, Object> kakaoLogin(String code) {
    AccessTokenResponse tokenResponse = getTokens(code);
    KakaoUserInfo userInfo = getUserInfo(tokenResponse.getAccess_token());
    User user = saveOrUpdate(userInfo);

    Map<String, Object> result = new HashMap<>();
    result.put("access_token", tokenResponse.getAccess_token());
    result.put("refresh_token", tokenResponse.getRefresh_token() != null ? tokenResponse.getRefresh_token() : "no_refresh_token");
    result.put("user", user);

    return result;
}

private AccessTokenResponse getTokens(String code) {
    RestTemplate rt = new RestTemplate();
    HttpHeaders headers = new HttpHeaders();
    headers.add("Content-type", "application/x-www-form-urlencoded;charset=utf-8");

    MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
    params.add("grant_type", "authorization_code");
    params.add("client_id", kakaoProperties.getRestApiKey());
    params.add("redirect_uri", kakaoProperties.getRedirectUri());
    params.add("code", code);
    params.add("client_secret", kakaoProperties.getClientSecret());

    logger.info("토큰 요청 파라미터 - grant_type: {}, client_id: {}, redirect_uri: {}, code: {}",
                params.get("grant_type"), params.get("client_id"), params.get("redirect_uri"), params.get("code"));

    HttpEntity<MultiValueMap<String, String>> kakaoTokenRequest = new HttpEntity<>(params, headers);

    try {
        // ResponseEntity의 제네릭 타입을 AccessTokenResponse로 지정
        ResponseEntity<AccessTokenResponse> response = rt.exchange(
            "https://kauth.kakao.com/oauth/token",
            HttpMethod.POST,
            kakaoTokenRequest,
            AccessTokenResponse.class // String 대신 AccessTokenResponse로 변경
        );
        logger.info("토큰 응답 상태 코드: {}", response.getStatusCode());
        logger.info("토큰 응답: {}", response.getBody());
        return response.getBody(); // 바로 객체 반환
    } catch (HttpClientErrorException e) {
        logger.error("토큰 요청 실패: {}", e.getMessage());
        logger.error("카카오 API 오류 응답: {}", e.getResponseBodyAsString());
        throw new RuntimeException("카카오 API 오류", e);
    } catch (Exception e) {
        logger.error("토큰 요청 실패: {}", e.getMessage());
        throw new RuntimeException("토큰 발급 실패", e);
    }
}


private KakaoUserInfo getUserInfo(String accessToken) {
    RestTemplate rt = new RestTemplate();
    HttpHeaders headers = new HttpHeaders();
    headers.add("Authorization", "Bearer " + accessToken);
    headers.add("Content-type", "application/x-www-form-urlencoded;charset=utf-8");

    logger.info("Authorization Header: Bearer " + accessToken);
    
    HttpEntity<String> entity = new HttpEntity<>(headers);

    try {
        // ResponseEntity의 제네릭 타입을 KakaoUserInfo로 지정
        ResponseEntity<KakaoUserInfo> response = rt.exchange(
            "https://kapi.kakao.com/v2/user/me",
            HttpMethod.GET,
            entity,
            KakaoUserInfo.class // String 대신 KakaoUserInfo로 변경
        );
        logger.info("사용자 정보 응답: {}", response.getBody());
        return response.getBody(); // 바로 객체 반환
    } catch (Exception e) {
        logger.error("사용자 정보 요청 실패: {}", e.getMessage());
        throw new RuntimeException("사용자 정보 요청 실패", e);
    }
}

 private User saveOrUpdate(KakaoUserInfo userInfo) {
     User user = userRepository.findByKakaoId(userInfo.getId());

     if (user == null) {
         user = new User();
         user.setKakaoId(userInfo.getId());
     }

     KakaoUserInfo.KakaoAccount kakaoAccount = userInfo.getKakao_account();
     if (kakaoAccount != null) {
         user.setEmail(kakaoAccount.getEmail());

         KakaoUserInfo.KakaoAccount.Profile profile = kakaoAccount.getProfile();
         if (profile != null) {
             user.setNickname(profile.getNickname());
         }
     }
     return userRepository.save(user);
 }
 
 // 로그아웃(Logout)
 public void kakaoLogout(String accessToken) {
     RestTemplate rt = new RestTemplate();
     HttpHeaders headers = new HttpHeaders();
     headers.add("Authorization", "Bearer " + accessToken);

     HttpEntity<String> entity = new HttpEntity<>(headers);

     try {
         ResponseEntity<String> response = rt.exchange(
             "https://kapi.kakao.com/v1/user/logout",
             HttpMethod.POST,
             entity,
             String.class
         );
         logger.info("로그아웃 응답: {}", response.getBody());
     } catch (HttpClientErrorException e) {
         logger.error("카카오 로그아웃 실패: {}", e.getMessage());
         logger.error("카카오 API 오류 응답: {}", e.getResponseBodyAsString());
         throw new RuntimeException("카카오 API 오류", e);
     } catch (Exception e) {
         logger.error("로그아웃 실패: {}", e.getMessage());
         throw new RuntimeException("로그아웃 실패", e);
     }
 }
 
 @Transactional 
 // 메서드 실행 중 DB 작업이 모두 성공적으로 커밋되도록 보장하고,예외가 발생하면 롤백되어 데이터 무결성을 유지하는 기능
 public void kakaoUnlink(String accessToken) {
	    RestTemplate rt = new RestTemplate();
	    HttpHeaders headers = new HttpHeaders();
	    headers.add("Authorization", "Bearer " + accessToken);

	    HttpEntity<String> entity = new HttpEntity<>(headers);

	    try {
	        // 1. 사용자 정보 미리 가져오기 (unlink 전에 호출)
	        KakaoUserInfo userInfo = getUserInfo(accessToken);
	        String kakaoId = userInfo.getId();

	        // 2. Kakao API로 unlink 요청
	        ResponseEntity<String> response = rt.exchange(
	            "https://kapi.kakao.com/v1/user/unlink",
	            HttpMethod.POST,
	            entity,
	            String.class
	        );
	        logger.info("카카오 연결 해제 응답: {}", response.getBody());

	        // 3. DB에서 사용자 삭제
	        User user = userRepository.findByKakaoId(kakaoId);
	        if (user != null) {
	            userRepository.delete(user);
	            logger.info("DB에서 유저 삭제 완료: {}", kakaoId);
	        } else {
	            logger.warn("DB에서 찾을 수 없는 유저: {}", kakaoId);
	        }

	    } catch (HttpClientErrorException e) {
	        logger.error("카카오 연결 해제 실패: {}", e.getMessage());
	        logger.error("카카오 API 오류 응답: {}", e.getResponseBodyAsString());
	        throw new RuntimeException("카카오 API 오류", e);
	    } catch (Exception e) {
	        logger.error("카카오 연결 해제 실패: {}", e.getMessage());
	        throw new RuntimeException("카카오 연결 해제 실패", e);
	    }
	}

//🔥 DB에서 유저 삭제 (accessToken을 기반으로 kakaoId 찾아 삭제)
private void deleteUserByAccessToken(String accessToken) {
	try {
      KakaoUserInfo userInfo = getUserInfo(accessToken); // 사용자 정보 가져오기
      String kakaoId = userInfo.getId();

      User user = userRepository.findByKakaoId(kakaoId);
      if (user != null) {
          userRepository.delete(user); // DB에서 삭제
          logger.info("DB에서 유저 삭제 완료: {}", kakaoId);
      } else {
          logger.warn("DB에서 찾을 수 없는 유저: {}", kakaoId);
      }
  } catch (Exception e) {
      logger.error("DB 유저 삭제 중 오류 발생: {}", e.getMessage());
  }
}
 
 
}