package com.contactmanagement.repository;

import com.contactmanagement.entity.Contact;
import com.contactmanagement.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class ContactRepositoryTest {

    @Autowired
    private ContactRepository contactRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void testContactRepository() {
        // 1. Save a user
        User user = new User();
        user.setFirstName("Test");
        user.setLastName("User");
        user.setEmail("test@example.com");
        user.setPhone("0300-1234567");
        user.setPassword("password");
        User savedUser = userRepository.save(user);

        // 2. Save a contact
        Contact contact = new Contact();
        contact.setFirstName("Ali");
        contact.setLastName("Khan");
        contact.setTitle("Developer");
        contact.setUser(savedUser);
        Contact savedContact = contactRepository.save(contact);

        // 3. Get the user ID
        Long userId = savedUser.getId();

        // 4. Test findByUserId
        Pageable pageable = PageRequest.of(0, 10);
        Page<Contact> result = contactRepository.findByUserId(userId, pageable);

        // 5. Assert
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getFirstName()).isEqualTo("Ali");
    }
}