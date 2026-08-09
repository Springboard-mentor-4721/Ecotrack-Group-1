package com.ecotrack.ai.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.retry.backoff.ExponentialBackOffPolicy;
import org.springframework.retry.policy.SimpleRetryPolicy;
import org.springframework.retry.support.RetryTemplate;

import java.util.Map;
import com.ecotrack.ai.exception.AiTimeoutException;

@Configuration
public class AiRetryConfig {

    @Bean
    public RetryTemplate aiRetryTemplate() {
        RetryTemplate template = new RetryTemplate();

        SimpleRetryPolicy retryPolicy = new SimpleRetryPolicy(
                2, // 1 initial attempt + 1 retry, per Objective/Timeout strategy
                Map.of(AiTimeoutException.class, true,
                       org.springframework.ai.retry.TransientAiException.class, true)
        );
        template.setRetryPolicy(retryPolicy);

        ExponentialBackOffPolicy backOff = new ExponentialBackOffPolicy();
        backOff.setInitialInterval(500);
        backOff.setMultiplier(2.0);
        backOff.setMaxInterval(3000);
        template.setBackOffPolicy(backOff);

        return template;
    }
}
