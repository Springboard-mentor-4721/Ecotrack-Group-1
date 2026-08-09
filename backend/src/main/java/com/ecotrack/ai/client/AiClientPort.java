package com.ecotrack.ai.client;

import org.springframework.ai.chat.prompt.Prompt;

public interface AiClientPort {

    <T> T generateStructured(Prompt prompt, Class<T> responseType, AiCallOptions options);

    String generateText(Prompt prompt, AiCallOptions options);
}
