package com.pitstop.backend.auth;

import com.pitstop.backend.AbstractApiTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** US-1a (registration), US-1b (post-signup auto-login) and US-2 (login/logout). */
class AuthControllerTest extends AbstractApiTest {

    @Test
    @DisplayName("US-1a: registration creates an account")
    void registerSucceeds() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", "new@pitstop.app", "password", "password123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("new@pitstop.app"));
    }

    @Test
    @DisplayName("US-1b: signup returns a token so the user lands logged in")
    void registerReturnsToken() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", "auto@pitstop.app", "password", "password123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    @DisplayName("US-1a: a duplicate email is rejected")
    void duplicateEmailRejected() throws Exception {
        registerUser("taken@pitstop.app", "password123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", "taken@pitstop.app", "password", "password123"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Email already in use"));
    }

    @Test
    @DisplayName("US-1a: passwords under 8 characters are rejected")
    void shortPasswordRejected() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", "weak@pitstop.app", "password", "short"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("US-2: valid credentials return a token")
    void loginSucceeds() throws Exception {
        registerUser("driver@pitstop.app", "password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", "driver@pitstop.app", "password", "password123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.email").value("driver@pitstop.app"));
    }

    @Test
    @DisplayName("US-2: a wrong password is rejected with 401")
    void wrongPasswordRejected() throws Exception {
        registerUser("driver@pitstop.app", "password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", "driver@pitstop.app", "password", "wrongpassword"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("US-2: an unknown email is rejected with 401")
    void unknownEmailRejected() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", "ghost@pitstop.app", "password", "password123"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Passwords are stored hashed, never in plain text")
    void passwordIsHashed() throws Exception {
        registerUser("secure@pitstop.app", "password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", "secure@pitstop.app", "password", "password123"))))
                .andExpect(status().isOk());

        // The stored hash is a BCrypt digest, so the raw password never matches it directly.
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "email", "secure@pitstop.app",
                                "password", "$2a$10$notTheRealHash"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("/me identifies the caller behind a valid token")
    void meReturnsCurrentUser() throws Exception {
        String token = registerUser("driver@pitstop.app", "password123");

        mockMvc.perform(get("/api/auth/me").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("driver@pitstop.app"));
    }

    @Test
    @DisplayName("/me without a token is 401, not 403")
    void meRequiresToken() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("/me with a forged token is 401")
    void meRejectsForgedToken() throws Exception {
        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer not-a-real-token"))
                .andExpect(status().isUnauthorized());
    }
}
