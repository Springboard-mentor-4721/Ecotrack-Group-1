package com.ecotrack.ai.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.ecotrack.ai.interceptor.AiRateLimitInterceptor;
import com.ecotrack.user.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

@Configuration
@EnableConfigurationProperties(EcoTrackAiProperties.class)
public class AiConfig {

    @Bean
    public AiRateLimitInterceptor aiRateLimitInterceptor(EcoTrackAiProperties aiProperties, UserRepository userRepository, ObjectMapper objectMapper) {
        return new AiRateLimitInterceptor(aiProperties, userRepository, objectMapper);
    }

    @Bean
    public ChatClient.Builder chatClientBuilder(ChatModel chatModel) {
        return ChatClient.builder(chatModel)
                .defaultAdvisors(new SimpleLoggerAdvisor())
                .defaultSystem("""
                        You are a backend content-generation function for the EcoTrack platform.
                        You are NOT a chatbot and must never refer to yourself, apologize,
                        or produce conversational filler. Respond ONLY with the requested
                        structured JSON. Never include markdown code fences.
                        """);
    }

    @Bean
    public ChatClient chatClient(ChatClient.Builder builder) {
        return builder.build();
    }
}
