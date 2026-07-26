package com.contactmanagement.repository;

import com.contactmanagement.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setEmail("john.doe@example.com");
        user.setPhone("0300-1234567");
        user.setPassword("encodedPassword123");
        userRepository.save(user);
    }

    @Test
    void shouldSaveUser() {
        User savedUser = userRepository.save(user);
        assertThat(savedUser).isNotNull();
        assertThat(savedUser.getId()).isNotNull();
        assertThat(savedUser.getEmail()).isEqualTo("john.doe@example.com");
    }

    @Test
    void shouldFindUserByEmail() {
        Optional<User> foundUser = userRepository.findByEmail("john.doe@example.com");
        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getFirstName()).isEqualTo("John");
        assertThat(foundUser.get().getLastName()).isEqualTo("Doe");
    }

    @Test
    void shouldFindUserByPhone() {
        Optional<User> foundUser = userRepository.findByPhone("0300-1234567");
        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getEmail()).isEqualTo("john.doe@example.com");
    }

    @Test
    void shouldReturnEmptyWhenEmailNotFound() {
        Optional<User> foundUser = userRepository.findByEmail("nonexistent@example.com");
        assertThat(foundUser).isEmpty();
    }

    @Test
    void shouldReturnEmptyWhenPhoneNotFound() {
        Optional<User> foundUser = userRepository.findByPhone("0000-0000000");
        assertThat(foundUser).isEmpty();
    }

    @Test
    void shouldCheckIfEmailExists() {
        boolean exists = userRepository.existsByEmail("john.doe@example.com");
        assertThat(exists).isTrue();
    }

    @Test
    void shouldReturnFalseWhenEmailDoesNotExist() {
        boolean exists = userRepository.existsByEmail("nonexistent@example.com");
        assertThat(exists).isFalse();
    }

    @Test
    void shouldCheckIfPhoneExists() {
        boolean exists = userRepository.existsByPhone("0300-1234567");
        assertThat(exists).isTrue();
    }

    @Test
    void shouldReturnFalseWhenPhoneDoesNotExist() {
        boolean exists = userRepository.existsByPhone("0000-0000000");
        assertThat(exists).isFalse();
    }

    @Test
    void shouldUpdateUser() {
        User userToUpdate = userRepository.findByEmail("john.doe@example.com").orElse(null);
        assertThat(userToUpdate).isNotNull();

        userToUpdate.setFirstName("Jane");
        userToUpdate.setLastName("Smith");
        userRepository.save(userToUpdate);

        User updatedUser = userRepository.findByEmail("john.doe@example.com").orElse(null);
        assertThat(updatedUser).isNotNull();
        assertThat(updatedUser.getFirstName()).isEqualTo("Jane");
        assertThat(updatedUser.getLastName()).isEqualTo("Smith");
    }

    @Test
    void shouldDeleteUser() {
        User userToDelete = userRepository.findByEmail("john.doe@example.com").orElse(null);
        assertThat(userToDelete).isNotNull();

        userRepository.delete(userToDelete);

        Optional<User> deletedUser = userRepository.findByEmail("john.doe@example.com");
        assertThat(deletedUser).isEmpty();
    }
}