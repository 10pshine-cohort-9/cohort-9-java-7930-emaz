package com.contactmanagement.service;

import com.contactmanagement.dto.request.ChangePasswordRequest;
import com.contactmanagement.dto.request.UpdateProfileRequest;
import com.contactmanagement.dto.response.UserProfileResponse;
import com.contactmanagement.entity.User;
import com.contactmanagement.exception.DuplicateResourceException;
import com.contactmanagement.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private UserService userService;

    private User user;
    private BCryptPasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();

        user = new User();
        user.setId(1L);
        user.setFirstName("Emaz");
        user.setLastName("Khan");
        user.setEmail("emaz@gmail.com");
        user.setPhone("0300-1234567");
        user.setPassword(passwordEncoder.encode("password123"));

        // Mock SecurityContext - only when needed in tests
        // Don't stub here to avoid unnecessary stubbing
    }

    private void mockSecurityContext() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("emaz@gmail.com");
        SecurityContextHolder.setContext(securityContext);
    }

    // ========== GET PROFILE TESTS ==========

    @Test
    void shouldGetProfileSuccessfully() {
        mockSecurityContext();
        when(userRepository.findByEmail("emaz@gmail.com")).thenReturn(Optional.of(user));

        UserProfileResponse response = userService.getProfile();

        assertThat(response).isNotNull();
        assertThat(response.getFirstName()).isEqualTo("Emaz");
        assertThat(response.getLastName()).isEqualTo("Khan");
        assertThat(response.getEmail()).isEqualTo("emaz@gmail.com");
        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getMessage()).isEqualTo("Profile fetched successfully");
    }

    @Test
    void shouldThrowExceptionWhenUserNotFound() {
        mockSecurityContext();
        when(userRepository.findByEmail("emaz@gmail.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getProfile())
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("User not found");
    }

    // ========== UPDATE PROFILE TESTS ==========

    @Test
    void shouldUpdateProfileSuccessfully() {
        mockSecurityContext();
        when(userRepository.findByEmail("emaz@gmail.com")).thenReturn(Optional.of(user));
        when(userRepository.existsByEmail("emaz.ali@gmail.com")).thenReturn(false);
        when(userRepository.existsByPhone("0311-9876543")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(user);

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFirstName("Emaz");
        request.setLastName("Ali");
        request.setEmail("emaz.ali@gmail.com");
        request.setPhone("0311-9876543");

        UserProfileResponse response = userService.updateProfile(request);

        assertThat(response).isNotNull();
        assertThat(response.getFirstName()).isEqualTo("Emaz");
        assertThat(response.getLastName()).isEqualTo("Ali");
        assertThat(response.getEmail()).isEqualTo("emaz.ali@gmail.com");
        assertThat(response.getPhone()).isEqualTo("0311-9876543");
        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getMessage()).isEqualTo("Profile updated successfully");

        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenEmailAlreadyExists() {
        mockSecurityContext();
        when(userRepository.findByEmail("emaz@gmail.com")).thenReturn(Optional.of(user));
        when(userRepository.existsByEmail("existing@gmail.com")).thenReturn(true);

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFirstName("Emaz");
        request.setLastName("Ali");
        request.setEmail("existing@gmail.com");
        request.setPhone("0311-9876543");

        assertThatThrownBy(() -> userService.updateProfile(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Email already exists");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenPhoneAlreadyExists() {
        mockSecurityContext();
        when(userRepository.findByEmail("emaz@gmail.com")).thenReturn(Optional.of(user));
        when(userRepository.existsByEmail("emaz.ali@gmail.com")).thenReturn(false);
        when(userRepository.existsByPhone("0311-9876543")).thenReturn(true);

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFirstName("Emaz");
        request.setLastName("Ali");
        request.setEmail("emaz.ali@gmail.com");
        request.setPhone("0311-9876543");

        assertThatThrownBy(() -> userService.updateProfile(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Phone number already exists");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldUpdateProfileWithoutPhone() {
        mockSecurityContext();
        when(userRepository.findByEmail("emaz@gmail.com")).thenReturn(Optional.of(user));
        when(userRepository.existsByEmail("emaz.ali@gmail.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(user);

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFirstName("Emaz");
        request.setLastName("Ali");
        request.setEmail("emaz.ali@gmail.com");
        request.setPhone(null);

        UserProfileResponse response = userService.updateProfile(request);

        assertThat(response).isNotNull();
        assertThat(response.isSuccess()).isTrue();
        verify(userRepository, times(1)).save(any(User.class));
    }

    // ========== CHANGE PASSWORD TESTS ==========

    @Test
    void shouldChangePasswordSuccessfully() {
        mockSecurityContext();
        when(userRepository.findByEmail("emaz@gmail.com")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("password123");
        request.setNewPassword("newpassword123");
        request.setConfirmPassword("newpassword123");

        UserProfileResponse response = userService.changePassword(request);

        assertThat(response).isNotNull();
        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getMessage()).isEqualTo("Password changed successfully");

        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenCurrentPasswordIsWrong() {
        mockSecurityContext();
        when(userRepository.findByEmail("emaz@gmail.com")).thenReturn(Optional.of(user));

        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("wrongpassword");
        request.setNewPassword("newpassword123");
        request.setConfirmPassword("newpassword123");

        assertThatThrownBy(() -> userService.changePassword(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Current password is incorrect");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenPasswordsDoNotMatch() {
        mockSecurityContext();
        when(userRepository.findByEmail("emaz@gmail.com")).thenReturn(Optional.of(user));

        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("password123");
        request.setNewPassword("newpassword123");
        request.setConfirmPassword("differentpassword");

        assertThatThrownBy(() -> userService.changePassword(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("New password and confirm password do not match");

        verify(userRepository, never()).save(any(User.class));
    }

    // ========== LOGOUT TESTS ==========

    @Test
    void shouldLogoutSuccessfully() {
        mockSecurityContext();
        UserProfileResponse response = userService.logout();

        assertThat(response).isNotNull();
        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getMessage()).isEqualTo("Logged out successfully");
    }
}