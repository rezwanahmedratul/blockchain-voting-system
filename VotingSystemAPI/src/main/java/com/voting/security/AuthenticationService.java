package com.voting.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

/**
 * Authentication Service
 * Handles user authentication against MySQL database
 */
@Service
public class AuthenticationService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private JwtUtils jwtUtils;

    /**
     * Authenticate user with voter ID and password
     * 
     * @param voterId Voter ID
     * @param password Password
     * @return Role if authentication successful
     * @throws Exception if authentication fails
     */
    public String authenticate(String voterId, String password) throws Exception {
        String query = "SELECT role FROM voters WHERE voter_id = ? AND password = ?";
        
        try {
            String role = jdbcTemplate.queryForObject(query, 
                    new Object[]{voterId, password}, 
                    String.class);
            
            if (role != null && !role.isEmpty()) {
                return role;
            } else {
                throw new Exception("Invalid voter id or password");
            }
        } catch (Exception e) {
            throw new Exception("Invalid voter id or password");
        }
    }

    /**
     * Verify authorization token
     * 
     * @param token Authorization token (Bearer token)
     * @return Voter ID if valid
     * @throws Exception if token is invalid
     */
    public String verifyToken(String token) throws Exception {
        if (token == null || token.isEmpty()) {
            throw new Exception("Token is missing");
        }

        String bearerToken = token.replace("Bearer ", "");

        if (!jwtUtils.validateToken(bearerToken)) {
            throw new Exception("Invalid token");
        }

        String voterId = jwtUtils.getVoterIdFromToken(bearerToken);
        
        // Verify voter exists in database
        String query = "SELECT voter_id FROM voters WHERE voter_id = ?";
        try {
            String result = jdbcTemplate.queryForObject(query, 
                    new Object[]{voterId}, 
                    String.class);
            
            if (result == null || result.isEmpty()) {
                throw new Exception("Voter not found");
            }
            return voterId;
        } catch (Exception e) {
            throw new Exception("Forbidden");
        }
    }

}
