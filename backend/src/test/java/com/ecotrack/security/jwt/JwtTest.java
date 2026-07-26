package com.ecotrack.security.jwt;

import io.jsonwebtoken.io.Decoders;
import org.junit.jupiter.api.Test;

public class JwtTest {
    @Test
    public void testDecoding() {
        String secret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
        try {
            byte[] keyBytes = Decoders.BASE64.decode(secret);
            System.out.println("Success! Length: " + keyBytes.length);
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }
}
