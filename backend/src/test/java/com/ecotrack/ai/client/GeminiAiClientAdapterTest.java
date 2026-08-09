package com.ecotrack.ai.client;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.retry.support.RetryTemplate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class GeminiAiClientAdapterTest {

    @Mock
    private ChatClient.Builder chatClientBuilder;

    @Mock
    private RetryTemplate retryTemplate;

    @Test
    void testAdapterCreation() {
        when(chatClientBuilder.build()).thenReturn(mock(ChatClient.class));
        GeminiAiClientAdapter adapter = new GeminiAiClientAdapter(chatClientBuilder, retryTemplate);
        assertNotNull(adapter);
    }
}
