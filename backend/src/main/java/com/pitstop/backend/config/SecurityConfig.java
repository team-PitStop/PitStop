package com.pitstop.backend.config;

import com.pitstop.backend.auth.JwtAuthFilter;
import com.pitstop.backend.auth.JwtService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtService jwtService;

    public SecurityConfig(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // Instantiate the JWT filter by hand (it's not a @Component) so the servlet
        // container doesn't also register it as a plain filter and run it twice.
        JwtAuthFilter jwtAuthFilter = new JwtAuthFilter(jwtService);

        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            // No server sessions: every request authenticates itself via its JWT.
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public: you don't have a token yet when you register or log in.
                .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
                // Everything else (e.g. /api/auth/me, /api/vehicles) needs a valid token.
                .anyRequest().authenticated()
            )
            // Missing/invalid token -> 401 Unauthorized (Spring's default here is 403).
            // Write the response directly instead of sendError() so the request isn't
            // re-dispatched to /error (which is itself authenticated and would 403).
            .exceptionHandling(ex -> ex.authenticationEntryPoint((request, response, authException) -> {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Unauthorized\"}");
            }))
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // This is the port your Vite app is running on
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
