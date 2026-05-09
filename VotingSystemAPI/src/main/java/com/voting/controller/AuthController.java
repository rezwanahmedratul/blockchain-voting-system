package com.voting.controller;

import com.voting.dto.LoginRequest;
import com.voting.dto.LoginResponse;
import com.voting.security.AuthenticationService;
import com.voting.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication Controller
 * Handles login and authorization endpoints
 * Equivalent to Python FastAPI login endpoint
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationService authenticationService;

    @Autowired
    private JwtUtils jwtUtils;

    /**
     * Login endpoint - authenticates user with voter ID and password
     * 
     * @param voterId Voter ID
     * @param password Password
     * @param authorization Authorization header
     * @return LoginResponse with token and role
     */
    @GetMapping("/login")
    public ResponseEntity<?> login(
            @RequestParam String voterId,
            @RequestParam String password,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        
        try {
            // Verify authorization header
            if (authorization != null && !authorization.isEmpty()) {
                try {
                    authenticationService.verifyToken(authorization);
                } catch (Exception e) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(new ErrorResponse("Forbidden"));
                }
            }

            // Authenticate user
            String role = authenticationService.authenticate(voterId, password);

            // Generate JWT token
            String token = jwtUtils.generateToken(voterId, password, role);

            // Return response
            return ResponseEntity.ok(new LoginResponse(token, role));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(new HealthResponse("API is running"));
    }

    // Inner classes for request/response
    public static class ErrorResponse {
        public String error;

        public ErrorResponse(String error) {
            this.error = error;
        }

        public String getError() {
            return error;
        }

        public void setError(String error) {
            this.error = error;
        }
    }

    public static class HealthResponse {
        public String status;

        public HealthResponse(String status) {
            this.status = status;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }

}
