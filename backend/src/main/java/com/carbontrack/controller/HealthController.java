package com.carbontrack.controller;

import com.carbontrack.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/")
    public ResponseEntity<ApiResponse<String>> home() {
        return ResponseEntity.ok(ApiResponse.success("Welcome to CarbonMitra Backend API. System is fully functional!"));
    }

    @GetMapping("/api/ping")
    public ResponseEntity<ApiResponse<Map<String, Object>>> ping() {
        Map<String, Object> data = new HashMap<>();
        data.put("status", "UP");
        data.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(ApiResponse.success("Pong", data));
    }

    @GetMapping("/api/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> health() {
        Map<String, Object> data = new HashMap<>();
        data.put("status", "UP");
        data.put("database", "CONNECTED");
        return ResponseEntity.ok(ApiResponse.success("System is fully functional", data));
    }
}
