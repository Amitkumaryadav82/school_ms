package com.school.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;

@Service
public class PostgreSQLHttpService {
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    @Value("${postgrest.base.url:http://localhost:3000}")
    private String postgrestBaseUrl;
    
    public PostgreSQLHttpService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }
    
    /**
     * Execute a SELECT query via PostgREST
     */
    public List<Map<String, Object>> select(String tableName, String filter) {
        try {
            String url = postgrestBaseUrl + "/" + tableName;
            if (filter != null && !filter.isEmpty()) {
                url += "?" + filter;
            }
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class);
            
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            return objectMapper.convertValue(jsonNode, List.class);
            
        } catch (Exception e) {
            throw new RuntimeException("Error executing SELECT query: " + e.getMessage(), e);
        }
    }
    
    /**
     * Execute an INSERT via PostgREST
     */
    public void insert(String tableName, Map<String, Object> data) {
        try {
            String url = postgrestBaseUrl + "/" + tableName;
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Prefer", "return=minimal");
            
            String jsonData = objectMapper.writeValueAsString(data);
            HttpEntity<String> entity = new HttpEntity<>(jsonData, headers);
            
            restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            
        } catch (Exception e) {
            throw new RuntimeException("Error executing INSERT query: " + e.getMessage(), e);
        }
    }
    
    /**
     * Execute an UPDATE via PostgREST
     */
    public void update(String tableName, String filter, Map<String, Object> data) {
        try {
            String url = postgrestBaseUrl + "/" + tableName + "?" + filter;
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Prefer", "return=minimal");
            
            String jsonData = objectMapper.writeValueAsString(data);
            HttpEntity<String> entity = new HttpEntity<>(jsonData, headers);
            
            restTemplate.exchange(url, HttpMethod.PATCH, entity, String.class);
            
        } catch (Exception e) {
            throw new RuntimeException("Error executing UPDATE query: " + e.getMessage(), e);
        }
    }
    
    /**
     * Execute a DELETE via PostgREST
     */
    public void delete(String tableName, String filter) {
        try {
            String url = postgrestBaseUrl + "/" + tableName + "?" + filter;
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Prefer", "return=minimal");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            restTemplate.exchange(url, HttpMethod.DELETE, entity, String.class);
            
        } catch (Exception e) {
            throw new RuntimeException("Error executing DELETE query: " + e.getMessage(), e);
        }
    }
    
    /**
     * Get PostgREST base URL (for debugging)
     */
    public String getPostgrestBaseUrl() {
        return postgrestBaseUrl;
    }
    
    /**
     * Test connection to PostgREST
     */
    public boolean testConnection() {
        try {
            // Try the OpenAPI documentation endpoint which should always be available
            String url = postgrestBaseUrl;
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            System.err.println("PostgREST connection test failed: " + e.getMessage());
            return false;
        }
    }
}
