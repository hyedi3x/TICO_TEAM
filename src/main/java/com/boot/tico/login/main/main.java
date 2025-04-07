package com.boot.tico.login.main;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class main implements CommandLineRunner{
	 @Override
	    public void run(String... args) throws Exception {
	        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
	        String encodedPassword = encoder.encode("123456");
	        System.out.println("Encoded password: " + encodedPassword);
	    }
	}
