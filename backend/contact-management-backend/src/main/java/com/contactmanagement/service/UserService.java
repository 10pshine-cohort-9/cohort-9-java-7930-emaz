package com.contactmanagement.service;

import com.contactmanagement.dto.request.ChangePasswordRequest;
import com.contactmanagement.dto.request.UpdateProfileRequest;
import com.contactmanagement.dto.response.UserProfileResponse;
import com.contactmanagement.entity.User;
import com.contactmanagement.exception.DuplicateResourceException;
import com.contactmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @Transactional
    public UserProfileResponse getProfile() {
        log.info("Fetching profile for current user");
        User user = getCurrentUser();

        return UserProfileResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .success(true)
                .message("Profile fetched successfully")
                .build();
    }

    @Transactional
    public UserProfileResponse updateProfile(UpdateProfileRequest request) {
        log.info("Updating profile for current user");
        User user = getCurrentUser();

        // Check if email already exists for another user
        if (!user.getEmail().equals(request.getEmail()) &&
                userRepository.existsByEmail(request.getEmail())) {
            log.warn("Update failed: Email already exists - {}", request.getEmail());
            throw new DuplicateResourceException("Email already exists: " + request.getEmail());
        }


// Check if phone already exists for another user
        if (request.getPhone() != null && !request.getPhone().isEmpty() &&
                !Objects.equals(user.getPhone(), request.getPhone()) &&  // ← Fix
                userRepository.existsByPhone(request.getPhone())) {
            log.warn("Update failed: Phone already exists - {}", request.getPhone());
            throw new DuplicateResourceException("Phone number already exists: " + request.getPhone());
        }

        // Update user fields
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());

        User updatedUser = userRepository.save(user);
        log.info("Profile updated successfully for user: {}", updatedUser.getEmail());

        return UserProfileResponse.builder()
                .id(updatedUser.getId())
                .firstName(updatedUser.getFirstName())
                .lastName(updatedUser.getLastName())
                .email(updatedUser.getEmail())
                .phone(updatedUser.getPhone())
                .success(true)
                .message("Profile updated successfully")
                .build();
    }

    @Transactional
    public UserProfileResponse changePassword(ChangePasswordRequest request) {
        log.info("Changing password for current user");
        User user = getCurrentUser();

        // In UserService.java - changePassword method
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            log.warn("Password change failed: Current password is incorrect");
            throw new IllegalArgumentException("Current password is incorrect");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            log.warn("Password change failed: New password and confirm password do not match");
            throw new IllegalArgumentException("New password and confirm password do not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed successfully for user: {}", user.getEmail());

        return UserProfileResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .success(true)
                .message("Password changed successfully")
                .build();
    }

    @Transactional
    public UserProfileResponse logout() {
        // Logout is handled client-side by removing the token
        // This endpoint just logs the activity
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication != null ? authentication.getName() : "unknown";
        log.info("User logged out: {}", email);

        // Clear security context
        SecurityContextHolder.clearContext();

        return UserProfileResponse.builder()
                .success(true)
                .message("Logged out successfully")
                .build();
    }
}