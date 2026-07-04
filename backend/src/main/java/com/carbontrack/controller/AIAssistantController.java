package com.carbontrack.controller;

import com.carbontrack.dto.AIChatRequest;
import com.carbontrack.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI Eco-Assistant", description = "Endpoints for interacting with the AI Sustainability chatbot")
@SecurityRequirement(name = "bearerAuth")
@Slf4j
public class AIAssistantController {

    @Value("${cohere.api-key:your_cohere_api_key_here}")
    private String cohereApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/chat")
    @Operation(summary = "Chat with the AI Eco-Assistant using Cohere API")
    public ResponseEntity<ApiResponse<Map<String, String>>> chat(@RequestBody AIChatRequest request) {
        if ("your_cohere_api_key_here".equals(cohereApiKey) || cohereApiKey == null || cohereApiKey.trim().isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("text", "Hi! The AI Eco-Assistant is currently offline because the Cohere API key is not configured. Please supply a valid Cohere API key in the backend application.yml properties to activate me!");
            return ResponseEntity.ok(ApiResponse.success("Cohere key is not configured, sent offline notification", response));
        }

        try {
            String url = "https://api.cohere.ai/v1/chat";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(cohereApiKey);

            // Construct Cohere Request Body
            Map<String, Object> body = new HashMap<>();
            body.put("message", request.getMessage());
            body.put("preamble", "You are the CarbonTrack AI Eco-Assistant, a helpful and premium virtual assistant specialized in sustainability, green choices, carbon footprints, and environmental preservation. Give concise, encouraging, and actionable recommendations. Do not mention that you are using Cohere unless explicitly asked.");

            if (request.getChatHistory() != null && !request.getChatHistory().isEmpty()) {
                List<Map<String, String>> cohereHistory = new ArrayList<>();
                for (AIChatRequest.HistoryMessage historyMsg : request.getChatHistory()) {
                    Map<String, String> msgMap = new HashMap<>();
                    msgMap.put("role", historyMsg.getRole());
                    msgMap.put("message", historyMsg.getMessage());
                    cohereHistory.add(msgMap);
                }
                body.put("chat_history", cohereHistory);
            }

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> responseEntity = restTemplate.postForEntity(url, entity, Map.class);

            if (responseEntity.getStatusCode() == HttpStatus.OK && responseEntity.getBody() != null) {
                Map responseBody = responseEntity.getBody();
                String text = (String) responseBody.get("text");

                Map<String, String> result = new HashMap<>();
                result.put("text", text);
                return ResponseEntity.ok(ApiResponse.success("AI response generated successfully", result));
            } else {
                throw new RuntimeException("Cohere API returned unexpected status code: " + responseEntity.getStatusCode());
            }

        } catch (Exception e) {
            log.error("Error communicating with Cohere API: {}", e.getMessage(), e);
            Map<String, String> errorFallback = new HashMap<>();
            errorFallback.put("text", "Oops! I encountered an error communicating with my neural core: " + e.getMessage() + ". Please check backend logs or try again shortly.");
            return ResponseEntity.ok(ApiResponse.success("AI error occurred, returned graceful error fallback response", errorFallback));
        }
    }
}
