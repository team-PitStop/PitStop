package com.pitstop.backend.auth;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Unit tests for token issuing and verification. No Spring context: these are
 * pure checks on the signing/expiry logic that every authenticated request relies on.
 */
class JwtServiceTest {

    private static final String SECRET = "test-only-secret-0123456789-0123456789-0123456789";
    private static final long ONE_DAY_MS = 86_400_000L;

    private final JwtService jwtService = new JwtService(SECRET, ONE_DAY_MS);

    @Test
    @DisplayName("A freshly issued token carries the user's email and validates")
    void issuedTokenRoundTrips() {
        String token = jwtService.generateToken("driver@pitstop.app");

        assertTrue(jwtService.isTokenValid(token));
        assertEquals("driver@pitstop.app", jwtService.extractEmail(token));
    }

    @Test
    @DisplayName("Two users never receive the same token")
    void tokensAreUserSpecific() {
        assertNotEquals(
                jwtService.generateToken("a@pitstop.app"),
                jwtService.generateToken("b@pitstop.app"));
    }

    @Test
    @DisplayName("A tampered payload fails signature verification")
    void tamperedTokenIsRejected() {
        String token = jwtService.generateToken("driver@pitstop.app");
        String tampered = token.substring(0, token.length() - 4) + "AAAA";

        assertFalse(jwtService.isTokenValid(tampered));
    }

    @Test
    @DisplayName("A token signed with a different secret is rejected")
    void foreignSecretIsRejected() {
        JwtService attacker = new JwtService(
                "attacker-secret-9876543210-9876543210-9876543210", ONE_DAY_MS);
        String forged = attacker.generateToken("driver@pitstop.app");

        assertFalse(jwtService.isTokenValid(forged));
    }

    @Test
    @DisplayName("An expired token is rejected")
    void expiredTokenIsRejected() {
        JwtService alreadyExpired = new JwtService(SECRET, -1_000L);
        String token = alreadyExpired.generateToken("driver@pitstop.app");

        assertFalse(alreadyExpired.isTokenValid(token));
    }

    @Test
    @DisplayName("Garbage input is rejected rather than throwing")
    void malformedTokenIsRejected() {
        assertFalse(jwtService.isTokenValid("not-a-jwt"));
        assertFalse(jwtService.isTokenValid(""));
    }
}
