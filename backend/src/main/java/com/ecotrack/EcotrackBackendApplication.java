package com.ecotrack;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class EcotrackBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(EcotrackBackendApplication.class, args);
	}

}
