package com.pitstop.backend.auth;

import com.pitstop.backend.user.User;
import com.pitstop.backend.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173") // Ensure this is 5173!
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

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

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        // Look up the user, then check the password against the stored BCrypt hash.
        // On any failure we return the SAME generic 401 so we don't reveal whether the
        // email exists (avoids handing attackers a way to enumerate accounts).
        Optional<User> user = email == null ? Optional.empty() : userRepository.findByEmail(email);
        if (user.isEmpty() || password == null
                || !passwordEncoder.matches(password, user.get().getPasswordHash())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        }

        String token = jwtService.generateToken(user.get().getEmail());
        return ResponseEntity.ok(Map.of("token", token, "email", user.get().getEmail()));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        // JwtAuthFilter stores the email as the authentication name when the token is valid.
        return ResponseEntity.ok(Map.of("email", authentication.getName()));
    }
}