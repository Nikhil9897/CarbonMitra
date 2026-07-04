package com.carbontrack.dto;

import lombok.Data;
import java.util.List;

@Data
public class AIChatRequest {
    private String message;
    private List<HistoryMessage> chatHistory;

    @Data
    public static class HistoryMessage {
        private String role; // "USER" or "CHATBOT"
        private String message;
    }
}
