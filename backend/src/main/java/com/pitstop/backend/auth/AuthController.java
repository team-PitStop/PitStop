package com.pitstop.backend.auth;

import com.pitstop.backend.user.User;
import com.pitstop.backend.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173") // Ensure this is 5173!
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    // Use BCrypt to hide passwords from plain sight (Security Requirement)
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        // 1. Check for duplicate email (Acceptance Criteria)
        // Using the existsByEmail method your teammate already wrote!
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already in use"));
        }

        // 2. Enforce 8 character password (Acceptance Criteria)
        if (password == null || password.length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 8 characters"));
        }

        // 3. Hash the password and create the user object
        String hashedPassword = passwordEncoder.encode(password);
        
        // Using the constructor your teammate wrote: User(email, passwordHash)
        User newUser = new User(email, hashedPassword);
        
        // 4. Save to PostgreSQL
        userRepository.save(newUser);

        return ResponseEntity.ok(Map.of("message", "User registered successfully!"));
    }
}