package com.voting.dto;

/**
 * Login Request DTO
 */
public class LoginRequest {
    private String voterId;
    private String password;

    public LoginRequest() {
    }

    public LoginRequest(String voterId, String password) {
        this.voterId = voterId;
        this.password = password;
    }

    public String getVoterId() {
        return voterId;
    }

    public void setVoterId(String voterId) {
        this.voterId = voterId;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
