package com.voting;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main Spring Boot Application class for Voting System API
 * Replaces the Python FastAPI backend with Java implementation
 */
@SpringBootApplication
public class VotingSystemApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(VotingSystemApiApplication.class, args);
    }

}
