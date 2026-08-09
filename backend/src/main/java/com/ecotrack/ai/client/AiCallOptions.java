package com.ecotrack.ai.client;

public record AiCallOptions(
        String modelOverride,
        Double temperature,
        Integer maxOutputTokens,
        Integer timeoutSeconds
) {
    public static AiCallOptions defaults() {
        return new AiCallOptions(null, null, null, null);
    }
}
