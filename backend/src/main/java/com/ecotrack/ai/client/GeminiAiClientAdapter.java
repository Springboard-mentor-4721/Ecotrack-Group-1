package com.ecotrack.ai.client;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.retry.support.RetryTemplate;
import org.springframework.stereotype.Component;
import com.ecotrack.ai.config.GeminiOptionsFactory;

import com.ecotrack.ai.exception.AiServiceException;
import com.ecotrack.ai.exception.AiTimeoutException;

@Component
public class GeminiAiClientAdapter implements AiClientPort {

    private final ChatClient chatClient;
    private final RetryTemplate aiRetryTemplate;

    public GeminiAiClientAdapter(ChatClient.Builder chatClientBuilder,
                                  RetryTemplate aiRetryTemplate) {
        this.chatClient = chatClientBuilder.build();
        this.aiRetryTemplate = aiRetryTemplate;
    }

    @Override
    public <T> T generateStructured(Prompt prompt, Class<T> responseType, AiCallOptions options) {
        try {
            return aiRetryTemplate.execute(ctx ->
                chatClient.prompt(prompt)
                        .options(GeminiOptionsFactory.forFeature(options.modelOverride(), options.temperature(), options.maxOutputTokens()))
                        .call()
                        .entity(responseType)
            );
        } catch (org.springframework.ai.retry.NonTransientAiException e) {
            throw new AiServiceException("Non-retryable AI provider error", e);
        } catch (Exception e) {
            if (e.getCause() instanceof java.util.concurrent.TimeoutException || e instanceof java.util.concurrent.TimeoutException) {
                throw new AiTimeoutException("Gemini call exceeded configured timeout", e);
            }
            throw new AiServiceException("AI generation failed", e);
        }
    }

    @Override
    public String generateText(Prompt prompt, AiCallOptions options) {
        return aiRetryTemplate.execute(ctx ->
            chatClient.prompt(prompt)
                    .options(GeminiOptionsFactory.forFeature(options.modelOverride(), options.temperature(), options.maxOutputTokens()))
                    .call()
                    .content()
        );
    }
}
