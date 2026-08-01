package com.contactmanagement.controller;

import com.contactmanagement.dto.request.ChangePasswordRequest;
import com.contactmanagement.dto.request.UpdateProfileRequest;
import com.contactmanagement.dto.response.UserProfileResponse;
import com.contactmanagement.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile() {
        log.info("Received request to get user profile");
        UserProfileResponse response = userService.getProfile();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request) {
        log.info("Received request to update user profile");
        UserProfileResponse response = userService.updateProfile(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    public ResponseEntity<UserProfileResponse> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {
        log.info("Received request to change password");
        UserProfileResponse response = userService.changePassword(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<UserProfileResponse> logout() {
        log.info("Received logout request");
        UserProfileResponse response = userService.logout();
        return ResponseEntity.ok(response);
    }
}