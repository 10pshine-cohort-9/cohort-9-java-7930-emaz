package com.contactmanagement.service;

import com.contactmanagement.dto.request.RegisterRequest;
import com.contactmanagement.dto.response.AuthResponse;
import com.contactmanagement.entity.User;
import com.contactmanagement.exception.DuplicateResourceException;
import com.contactmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Attempting to register user with email: {}", request.getEmail());

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration failed: Email already exists - {}", request.getEmail());
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }

        // Check if phone already exists (if provided)
        if (request.getPhone() != null && !request.getPhone().isEmpty()) {
            if (userRepository.existsByPhone(request.getPhone())) {
                log.warn("Registration failed: Phone already exists - {}", request.getPhone());
                throw new DuplicateResourceException("Phone number already registered: " + request.getPhone());
            }
        }

        // Create new user
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Save user
        User savedUser = userRepository.save(user);
        log.info("User registered successfully with id: {}", savedUser.getId());

        return AuthResponse.builder()
                .id(savedUser.getId())
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .email(savedUser.getEmail())
                .phone(savedUser.getPhone())
                .success(true)
                .message("Registration successful! Please login.")
                .build();
    }
}