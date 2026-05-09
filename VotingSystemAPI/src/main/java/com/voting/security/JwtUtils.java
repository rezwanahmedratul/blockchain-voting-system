package com.voting.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.spec.SecretKeySpec;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * JWT Utility class for token generation and validation
 * Equivalent to Python's jwt.encode/decode operations
 */
@Component
public class JwtUtils {

    @Value("${jwt.secret:your-secret-key-change-in-env}")
    private String secretKey;

    /**
     * Generate JWT token with user credentials
     * 
     * @param voterId Voter ID
     * @param password Password
     * @param role User role
     * @return JWT token string
     */
    public String generateToken(String voterId, String password, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("password", password);
        claims.put("voter_id", voterId);
        claims.put("role", role);

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(new Date())
                .signWith(new SecretKeySpec(secretKey.getBytes(), 
                        SignatureAlgorithm.HS256.getJcaName()), 
                        SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Validate JWT token
     * 
     * @param token JWT token to validate
     * @return true if token is valid, false otherwise
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(secretKey.getBytes())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Extract voter ID from token
     * 
     * @param token JWT token
     * @return Voter ID
     */
    public String getVoterIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(secretKey.getBytes())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return (String) claims.get("voter_id");
    }

}
