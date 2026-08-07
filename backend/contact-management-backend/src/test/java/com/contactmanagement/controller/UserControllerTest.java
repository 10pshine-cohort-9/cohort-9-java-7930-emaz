package com.contactmanagement.controller;

import com.contactmanagement.dto.request.ChangePasswordRequest;
import com.contactmanagement.dto.request.UpdateProfileRequest;
import com.contactmanagement.dto.response.UserProfileResponse;
import com.contactmanagement.exception.DuplicateResourceException;
import com.contactmanagement.security.JwtTokenProvider;
import com.contactmanagement.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldGetProfileSuccessfully() throws Exception {
        UserProfileResponse response = UserProfileResponse.builder()
                .id(1L)
                .firstName("Emaz")
                .lastName("Khan")
                .email("emaz@gmail.com")
                .phone("0300-1234567")
                .success(true)
                .message("Profile fetched successfully")
                .build();

        when(userService.getProfile()).thenReturn(response);

        mockMvc.perform(get("/api/users/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Emaz"))
                .andExpect(jsonPath("$.lastName").value("Khan"))
                .andExpect(jsonPath("$.email").value("emaz@gmail.com"))
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void shouldUpdateProfileSuccessfully() throws Exception {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFirstName("Emaz");
        request.setLastName("Ali");
        request.setEmail("emaz.ali@gmail.com");
        request.setPhone("0311-9876543");

        UserProfileResponse response = UserProfileResponse.builder()
                .id(1L)
                .firstName("Emaz")
                .lastName("Ali")
                .email("emaz.ali@gmail.com")
                .phone("0311-9876543")
                .success(true)
                .message("Profile updated successfully")
                .build();

        when(userService.updateProfile(any(UpdateProfileRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/users/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Emaz"))
                .andExpect(jsonPath("$.lastName").value("Ali"))
                .andExpect(jsonPath("$.email").value("emaz.ali@gmail.com"))
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void shouldReturnBadRequestForInvalidUpdate() throws Exception {
        UpdateProfileRequest request = new UpdateProfileRequest();

        mockMvc.perform(put("/api/users/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldReturnConflictWhenEmailExists() throws Exception {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFirstName("Emaz");
        request.setLastName("Ali");
        request.setEmail("existing@gmail.com");
        request.setPhone("0311-9876543");

        when(userService.updateProfile(any(UpdateProfileRequest.class)))
                .thenThrow(new DuplicateResourceException("Email already exists: existing@gmail.com"));

        mockMvc.perform(put("/api/users/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    void shouldChangePasswordSuccessfully() throws Exception {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("password123");
        request.setNewPassword("newpassword123");
        request.setConfirmPassword("newpassword123");

        UserProfileResponse response = UserProfileResponse.builder()
                .id(1L)
                .firstName("Emaz")
                .lastName("Khan")
                .email("emaz@gmail.com")
                .phone("0300-1234567")
                .success(true)
                .message("Password changed successfully")
                .build();

        when(userService.changePassword(any(ChangePasswordRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/users/change-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Password changed successfully"));
    }

    @Test
    void shouldReturnBadRequestForInvalidChangePassword() throws Exception {
        ChangePasswordRequest request = new ChangePasswordRequest();

        mockMvc.perform(post("/api/users/change-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldReturnBadRequestWhenCurrentPasswordWrong() throws Exception {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("wrongpassword");
        request.setNewPassword("newpassword123");
        request.setConfirmPassword("newpassword123");

        when(userService.changePassword(any(ChangePasswordRequest.class)))
                .thenThrow(new IllegalArgumentException("Current password is incorrect"));

        mockMvc.perform(post("/api/users/change-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());  // ← 400 Bad Request
    }

    @Test
    void shouldLogoutSuccessfully() throws Exception {
        UserProfileResponse response = UserProfileResponse.builder()
                .success(true)
                .message("Logged out successfully")
                .build();

        when(userService.logout()).thenReturn(response);

        mockMvc.perform(post("/api/users/logout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Logged out successfully"));
    }
}