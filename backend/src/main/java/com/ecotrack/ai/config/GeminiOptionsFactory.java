package com.ecotrack.ai.config;

import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.chat.prompt.ChatOptions;

public final class GeminiOptionsFactory {

    private GeminiOptionsFactory() {}

    public static ChatOptions forFeature(String model, double temperature, int maxTokens) {
        return OpenAiChatOptions.builder()
                .model(model)
                .maxTokens(maxTokens)
                .responseFormat(org.springframework.ai.openai.api.ResponseFormat.builder().type(org.springframework.ai.openai.api.ResponseFormat.Type.JSON_OBJECT).build())
                .build();
    }
}
