package com.example.MyDentalAPI.ConsultorioDentistaAPI;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class ConsultorioDentistaApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(ConsultorioDentistaApiApplication.class, args);
	}

}
