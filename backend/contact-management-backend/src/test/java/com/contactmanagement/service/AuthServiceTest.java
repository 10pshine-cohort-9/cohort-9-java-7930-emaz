package com.contactmanagement.service;

import com.contactmanagement.dto.request.RegisterRequest;
import com.contactmanagement.dto.response.AuthResponse;
import com.contactmanagement.entity.User;
import com.contactmanagement.exception.DuplicateResourceException;
import com.contactmanagement.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setFirstName("John");
        registerRequest.setLastName("Doe");
        registerRequest.setEmail("john.doe@example.com");
        registerRequest.setPhone("0300-1234567");
        registerRequest.setPassword("password123");
    }

    @Test
    void shouldRegisterUserSuccessfully() {
        // Given
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
        when(userRepository.existsByPhone(registerRequest.getPhone())).thenReturn(false);

        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setFirstName(registerRequest.getFirstName());
        savedUser.setLastName(registerRequest.getLastName());
        savedUser.setEmail(registerRequest.getEmail());
        savedUser.setPhone(registerRequest.getPhone());

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        // When
        AuthResponse response = authService.register(registerRequest);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getEmail()).isEqualTo(registerRequest.getEmail());
        assertThat(response.getMessage()).isEqualTo("Registration successful! Please login.");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenEmailAlreadyExists() {
        // Given
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Email already registered");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenPhoneAlreadyExists() {
        // Given
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
        when(userRepository.existsByPhone(registerRequest.getPhone())).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Phone number already registered");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldRegisterUserWithoutPhoneNumber() {
        // Given
        registerRequest.setPhone(null);

        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);

        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setFirstName(registerRequest.getFirstName());
        savedUser.setLastName(registerRequest.getLastName());
        savedUser.setEmail(registerRequest.getEmail());
        savedUser.setPhone(null);

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        // When
        AuthResponse response = authService.register(registerRequest);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getPhone()).isNull();
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void shouldEncodePasswordBeforeSaving() {
        // Given
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
        when(userRepository.existsByPhone(registerRequest.getPhone())).thenReturn(false);

        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setFirstName(registerRequest.getFirstName());
        savedUser.setLastName(registerRequest.getLastName());
        savedUser.setEmail(registerRequest.getEmail());
        savedUser.setPhone(registerRequest.getPhone());

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        // When
        authService.register(registerRequest);

        // Then
        verify(userRepository).save(argThat(user ->
                user.getPassword() != null &&
                        !user.getPassword().equals(registerRequest.getPassword()) &&
                        user.getPassword().startsWith("$2a$")
        ));
    }
}