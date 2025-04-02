package com.boot.tico.login.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Collections;

@Component
public class CustomAuthorityUtils {
	// 기본적으로 ROLE_USER 하나만 부여
    public Collection<? extends GrantedAuthority> createRoles(String email) {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
    }
}
