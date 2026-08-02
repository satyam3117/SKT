package com.skt.order_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import lombok.extern.slf4j.Slf4j;

@SpringBootApplication
@Slf4j
public class OrderServiceApplication {

	public static void main(String[] args) {
		log.info("ORDER SERVICE APPLICATION STARTED");
		SpringApplication.run(OrderServiceApplication.class, args);
	}

}
