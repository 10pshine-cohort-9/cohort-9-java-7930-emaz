package com.contactmanagement.service;

import com.contactmanagement.dto.request.LoginRequest;
import com.contactmanagement.dto.request.RegisterRequest;
import com.contactmanagement.dto.response.AuthResponse;
import com.contactmanagement.dto.response.LoginResponse;
import com.contactmanagement.entity.User;
import com.contactmanagement.exception.DuplicateResourceException;
import com.contactmanagement.repository.UserRepository;
import com.contactmanagement.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User user;
    private BCryptPasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();

        registerRequest = new RegisterRequest();
        registerRequest.setFirstName("John");
        registerRequest.setLastName("Doe");
        registerRequest.setEmail("john.doe@example.com");
        registerRequest.setPhone("0300-1234567");
        registerRequest.setPassword("password123");

        loginRequest = new LoginRequest();
        loginRequest.setEmailOrPhone("john.doe@example.com");
        loginRequest.setPassword("password123");

        user = new User();
        user.setId(1L);
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setEmail("john.doe@example.com");
        user.setPhone("0300-1234567");
        user.setPassword(passwordEncoder.encode("password123"));
    }

    // ========== REGISTRATION TESTS ==========

    @Test
    void shouldRegisterUserSuccessfully() {
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
        when(userRepository.existsByPhone(registerRequest.getPhone())).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(user);

        AuthResponse response = authService.register(registerRequest);

        assertThat(response).isNotNull();
        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getEmail()).isEqualTo(registerRequest.getEmail());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenEmailAlreadyExists() {
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Email already registered");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenPhoneAlreadyExists() {
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
        when(userRepository.existsByPhone(registerRequest.getPhone())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Phone number already registered");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldRegisterUserWithoutPhoneNumber() {
        registerRequest.setPhone(null);

        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(user);

        AuthResponse response = authService.register(registerRequest);

        assertThat(response).isNotNull();
        assertThat(response.isSuccess()).isTrue();
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void shouldEncodePasswordBeforeSaving() {
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
        when(userRepository.existsByPhone(registerRequest.getPhone())).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(user);

        authService.register(registerRequest);

        verify(userRepository).save(argThat(u ->
                u.getPassword() != null &&
                        !u.getPassword().equals(registerRequest.getPassword()) &&
                        u.getPassword().startsWith("$2a$")
        ));
    }

    // ========== LOGIN TESTS ==========

    @Test
    void shouldLoginSuccessfullyWithEmail() {
        when(userRepository.findByEmail(loginRequest.getEmailOrPhone()))
                .thenReturn(Optional.of(user));
        when(jwtTokenProvider.generateToken(user.getEmail()))
                .thenReturn("jwt-token-123");

        LoginResponse response = authService.login(loginRequest);

        assertThat(response).isNotNull();
        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getToken()).isEqualTo("jwt-token-123");
        assertThat(response.getEmail()).isEqualTo(user.getEmail());
        verify(jwtTokenProvider, times(1)).generateToken(user.getEmail());
    }

    @Test
    void shouldLoginSuccessfullyWithPhone() {
        loginRequest.setEmailOrPhone("0300-1234567");

        when(userRepository.findByEmail(loginRequest.getEmailOrPhone()))
                .thenReturn(Optional.empty());
        when(userRepository.findByPhone(loginRequest.getEmailOrPhone()))
                .thenReturn(Optional.of(user));
        when(jwtTokenProvider.generateToken(user.getEmail()))
                .thenReturn("jwt-token-123");

        LoginResponse response = authService.login(loginRequest);

        assertThat(response).isNotNull();
        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getToken()).isEqualTo("jwt-token-123");
        verify(jwtTokenProvider, times(1)).generateToken(user.getEmail());
    }

    @Test
    void shouldThrowExceptionWhenUserNotFound() {
        when(userRepository.findByEmail(loginRequest.getEmailOrPhone()))
                .thenReturn(Optional.empty());
        when(userRepository.findByPhone(loginRequest.getEmailOrPhone()))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Invalid email/phone or password");

        verify(jwtTokenProvider, never()).generateToken(anyString());
    }

    @Test
    void shouldThrowExceptionWhenPasswordIsIncorrect() {
        when(userRepository.findByEmail(loginRequest.getEmailOrPhone()))
                .thenReturn(Optional.of(user));

        loginRequest.setPassword("wrongpassword");

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Invalid email/phone or password");

        verify(jwtTokenProvider, never()).generateToken(anyString());
    }

    @Test
    void shouldGenerateTokenOnSuccessfulLogin() {
        when(userRepository.findByEmail(loginRequest.getEmailOrPhone()))
                .thenReturn(Optional.of(user));
        when(jwtTokenProvider.generateToken(user.getEmail()))
                .thenReturn("generated-jwt-token");

        LoginResponse response = authService.login(loginRequest);

        assertThat(response.getToken()).isEqualTo("generated-jwt-token");
        verify(jwtTokenProvider, times(1)).generateToken(user.getEmail());
    }
}