package com.boot.tico.login.dto;

import lombok.Data;

@Data
public class KakaoUserInfo {
 private String id;
 private KakaoAccount kakao_account;

 @Data
 public static class KakaoAccount {
     private String email;
     private Profile profile;

     @Data
     public static class Profile {
         private String nickname;
     }
 }

 public String getEmailOrDefault() {
     return (kakao_account != null && kakao_account.email != null) ? kakao_account.email : "no-email@domain.com";
 }
}