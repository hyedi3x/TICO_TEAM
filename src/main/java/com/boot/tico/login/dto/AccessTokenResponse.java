package com.boot.tico.login.dto;

import lombok.Data;

@Data
public class AccessTokenResponse {
 private String access_token;
 private String refresh_token;
}