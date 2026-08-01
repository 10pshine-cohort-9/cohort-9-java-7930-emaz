package com.contactmanagement.service;

import com.contactmanagement.dto.request.LoginRequest;
import com.contactmanagement.dto.request.RegisterRequest;
import com.contactmanagement.dto.response.AuthResponse;
import com.contactmanagement.dto.response.LoginResponse;
import com.contactmanagement.entity.User;
import com.contactmanagement.exception.DuplicateResourceException;
import com.contactmanagement.exception.InvalidCredentialsException;
import com.contactmanagement.repository.UserRepository;
import com.contactmanagement.security.JwtTokenProvider;
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
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Attempting to register user with email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration failed: Email already exists - {}", request.getEmail());
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }

        if (request.getPhone() != null && !request.getPhone().isEmpty()) {
            if (userRepository.existsByPhone(request.getPhone())) {
                log.warn("Registration failed: Phone already exists - {}", request.getPhone());
                throw new DuplicateResourceException("Phone number already registered: " + request.getPhone());
            }
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

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

    @Transactional
    public LoginResponse login(LoginRequest request) {
        log.info("Attempting login with: {}", request.getEmailOrPhone());

        User user = userRepository.findByEmail(request.getEmailOrPhone())
                .or(() -> userRepository.findByPhone(request.getEmailOrPhone()))
                .orElseThrow(() -> {
                    log.warn("Login failed: User not found - {}", request.getEmailOrPhone());
                    return new InvalidCredentialsException("Invalid email/phone or password");
                });

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Login failed: Invalid password for user - {}", request.getEmailOrPhone());
            throw new InvalidCredentialsException("Invalid email/phone or password");
        }

        String token = jwtTokenProvider.generateToken(user.getEmail());
        log.info("User logged in successfully: {}", user.getEmail());

        return LoginResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .token(token)
                .success(true)
                .message("Login successful!")
                .build();
    }
}