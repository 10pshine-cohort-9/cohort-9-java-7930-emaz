package com.contactmanagement.service;

import com.contactmanagement.dto.request.ContactRequest;
import com.contactmanagement.dto.response.ContactResponse;
import com.contactmanagement.entity.Contact;
import com.contactmanagement.entity.User;
import com.contactmanagement.exception.ContactNotFoundException;
import com.contactmanagement.repository.ContactRepository;
import com.contactmanagement.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContactServiceTest {

    @Mock
    private ContactRepository contactRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private ContactService contactService;

    private User user;
    private Contact contact;
    private ContactRequest contactRequest;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setFirstName("Emaz");
        user.setLastName("Khan");
        user.setEmail("emaz@gmail.com");

        contact = new Contact();
        contact.setId(1L);
        contact.setFirstName("Ahmed");
        contact.setLastName("Khan");
        contact.setTitle("Software Engineer");
        contact.setUser(user);

        contactRequest = new ContactRequest();
        contactRequest.setFirstName("Ahmed");
        contactRequest.setLastName("Khan");
        contactRequest.setTitle("Software Engineer");

        // Mock SecurityContext
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("emaz@gmail.com");
        SecurityContextHolder.setContext(securityContext);
    }

    // ========== CREATE CONTACT TESTS ==========

    @Test
    void shouldCreateContactSuccessfully() {
        when(userRepository.findByEmail("emaz@gmail.com")).thenReturn(Optional.of(user));
        when(contactRepository.save(any(Contact.class))).thenReturn(contact);

        ContactResponse response = contactService.createContact(contactRequest);

        assertThat(response).isNotNull();
        assertThat(response.getFirstName()).isEqualTo("Ahmed");
        assertThat(response.getLastName()).isEqualTo("Khan");
        assertThat(response.getTitle()).isEqualTo("Software Engineer");
        verify(contactRepository, times(1)).save(any(Contact.class));
    }

    @Test
    void shouldThrowExceptionWhenUserNotFound() {
        when(userRepository.findByEmail("emaz@gmail.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> contactService.createContact(contactRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("User not found");

        verify(contactRepository, never()).save(any(Contact.class));
    }

    // ========== GET CONTACT TESTS ==========

    @Test
    void shouldGetContactSuccessfully() {
        when(userRepository.findByEmail("emaz@gmail.com")).thenReturn(Optional.of(user));
        when(contactRepository.findById(1L)).thenReturn(Optional.of(contact));

        ContactResponse response = contactService.getContact(1L);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getFirstName()).isEqualTo("Ahmed");
        assertThat(response.getLastName()).isEqualTo("Khan");
    }

    @Test
    void shouldThrowExceptionWhenContactNotFound() {
        when(userRepository.findByEmail("emaz@gmail.com")).thenReturn(Optional.of(user));
        when(contactRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> contactService.getContact(999L))
                .isInstanceOf(ContactNotFoundException.class)
                .hasMessageContaining("Contact not found with id: 999");
    }

    @Test
    void shouldThrowExceptionWhenContactBelongsToAnotherUser() {
        User otherUser = new User();
        otherUser.setId(2L);
        contact.setUser(otherUser);

        when(userRepository.findByEmail("emaz@gmail.com")).thenReturn(Optional.of(user));
        when(contactRepository.findById(1L)).thenReturn(Optional.of(contact));

        assertThatThrownBy(() -> contactService.getContact(1L))
                .isInstanceOf(ContactNotFoundException.class)
                .hasMessageContaining("Contact not found");
    }

    // ========== GET ALL CONTACTS TESTS ==========

    @Test
    void shouldGetAllContactsSuccessfully() {
        when(userRepository.findByEmail("emaz@gmail.com")).thenReturn(Optional.of(user));
        Pageable pageable = PageRequest.of(0, 10);
        Page<Contact> contactPage = new PageImpl<>(Collections.singletonList(contact));
        when(contactRepository.findByUserId(user.getId(), pageable)).thenReturn(contactPage);

        Page<ContactResponse> response = contactService.getContacts(pageable);

        assertThat(response).isNotNull();
        assertThat(response.getTotalElements()).isEqualTo(1);
        assertThat(response.getContent().get(0).getFirstName()).isEqualTo("Ahmed");
    }

    // ========== SEARCH CONTACTS TESTS ==========

    @Test
    void shouldSearchContactsSuccessfully() {
        when(userRepository.findByEmail("emaz@gmail.com")).thenReturn(Optional.of(user));
        Pageable pageable = PageRequest.of(0, 10);
        Page<Contact> contactPage = new PageImpl<>(Collections.singletonList(contact));
        when(contactRepository.searchContacts(user.getId(), "Ahmed", pageable)).thenReturn(contactPage);

        Page<ContactResponse> response = contactService.searchContacts("Ahmed", pageable);

        assertThat(response).isNotNull();
        assertThat(response.getTotalElements()).isEqualTo(1);
        assertThat(response.getContent().get(0).getFirstName()).isEqualTo("Ahmed");
    }

    // ========== UPDATE CONTACT TESTS ==========

    @Test
    void shouldUpdateContactSuccessfully() {
        when(userRepository.findByEmail("emaz@gmail.com")).thenReturn(Optional.of(user));
        when(contactRepository.findById(1L)).thenReturn(Optional.of(contact));
        when(contactRepository.save(any(Contact.class))).thenReturn(contact);

        ContactRequest updateRequest = new ContactRequest();
        updateRequest.setFirstName("Updated");
        updateRequest.setLastName("Name");
        updateRequest.setTitle("Senior Engineer");

        ContactResponse response = contactService.updateContact(1L, updateRequest);

        assertThat(response).isNotNull();
        assertThat(response.getFirstName()).isEqualTo("Updated");
        assertThat(response.getLastName()).isEqualTo("Name");
        assertThat(response.getTitle()).isEqualTo("Senior Engineer");
        verify(contactRepository, times(1)).save(any(Contact.class));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingNonExistentContact() {
        when(userRepository.findByEmail("emaz@gmail.com")).thenReturn(Optional.of(user));
        when(contactRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> contactService.updateContact(999L, contactRequest))
                .isInstanceOf(ContactNotFoundException.class)
                .hasMessageContaining("Contact not found with id: 999");
    }

    // ========== DELETE CONTACT TESTS ==========

    @Test
    void shouldDeleteContactSuccessfully() {
        when(userRepository.findByEmail("emaz@gmail.com")).thenReturn(Optional.of(user));
        when(contactRepository.findById(1L)).thenReturn(Optional.of(contact));

        contactService.deleteContact(1L);

        verify(contactRepository, times(1)).delete(contact);
    }

    @Test
    void shouldThrowExceptionWhenDeletingNonExistentContact() {
        when(userRepository.findByEmail("emaz@gmail.com")).thenReturn(Optional.of(user));
        when(contactRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> contactService.deleteContact(999L))
                .isInstanceOf(ContactNotFoundException.class)
                .hasMessageContaining("Contact not found with id: 999");
    }
}