package com.contactmanagement.service;

import com.contactmanagement.dto.request.ContactRequest;
import com.contactmanagement.dto.response.ContactResponse;
import com.contactmanagement.entity.Contact;
import com.contactmanagement.entity.ContactEmail;
import com.contactmanagement.entity.ContactPhone;
import com.contactmanagement.entity.User;
import com.contactmanagement.exception.ContactNotFoundException;
import com.contactmanagement.repository.ContactRepository;
import com.contactmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContactService {

    private final ContactRepository contactRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    private ContactResponse mapToResponse(Contact contact) {
        return ContactResponse.builder()
                .id(contact.getId())
                .firstName(contact.getFirstName())
                .lastName(contact.getLastName())
                .title(contact.getTitle())
                .emails(contact.getEmails().stream()
                        .map(e -> ContactResponse.EmailResponse.builder()
                                .id(e.getId())
                                .label(e.getLabel())
                                .value(e.getValue())
                                .build())
                        .collect(Collectors.toList()))
                .phones(contact.getPhones().stream()
                        .map(p -> ContactResponse.PhoneResponse.builder()
                                .id(p.getId())
                                .label(p.getLabel())
                                .value(p.getValue())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }

    @Transactional
    public ContactResponse createContact(ContactRequest request) {
        log.info("Creating new contact for current user");
        User user = getCurrentUser();

        Contact contact = new Contact();
        contact.setFirstName(request.getFirstName());
        contact.setLastName(request.getLastName());
        contact.setTitle(request.getTitle());
        contact.setUser(user);

        // Add emails
        if (request.getEmails() != null) {
            for (ContactRequest.EmailRequest emailReq : request.getEmails()) {
                ContactEmail email = new ContactEmail();
                email.setLabel(emailReq.getLabel());
                email.setValue(emailReq.getValue());
                email.setContact(contact);
                contact.getEmails().add(email);
            }
        }

        // Add phones
        if (request.getPhones() != null) {
            for (ContactRequest.PhoneRequest phoneReq : request.getPhones()) {
                ContactPhone phone = new ContactPhone();
                phone.setLabel(phoneReq.getLabel());
                phone.setValue(phoneReq.getValue());
                phone.setContact(contact);
                contact.getPhones().add(phone);
            }
        }

        Contact savedContact = contactRepository.save(contact);
        log.info("Contact created successfully with id: {}", savedContact.getId());

        return mapToResponse(savedContact);
    }

    @Transactional(readOnly = true)
    public ContactResponse getContact(Long id) {
        log.info("Fetching contact with id: {}", id);
        User user = getCurrentUser();

        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new ContactNotFoundException(id));

        // Verify contact belongs to current user
        if (!contact.getUser().getId().equals(user.getId())) {
            log.warn("User {} attempted to access contact {} belonging to another user", user.getId(), id);
            throw new ContactNotFoundException("Contact not found");
        }

        return mapToResponse(contact);
    }

    @Transactional(readOnly = true)
    public Page<ContactResponse> getContacts(Pageable pageable) {
        log.info("Fetching contacts for current user");
        User user = getCurrentUser();

        Page<Contact> contacts = contactRepository.findByUserId(user.getId(), pageable);
        return contacts.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<ContactResponse> searchContacts(String search, Pageable pageable) {
        log.info("Searching contacts with term: {}", search);
        User user = getCurrentUser();

        Page<Contact> contacts = contactRepository.searchContacts(user.getId(), search, pageable);
        return contacts.map(this::mapToResponse);
    }

    @Transactional
    public ContactResponse updateContact(Long id, ContactRequest request) {
        log.info("Updating contact with id: {}", id);
        User user = getCurrentUser();

        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new ContactNotFoundException(id));

        // Verify contact belongs to current user
        if (!contact.getUser().getId().equals(user.getId())) {
            log.warn("User {} attempted to update contact {} belonging to another user", user.getId(), id);
            throw new ContactNotFoundException("Contact not found");
        }

        // Update basic fields
        contact.setFirstName(request.getFirstName());
        contact.setLastName(request.getLastName());
        contact.setTitle(request.getTitle());

        // Clear and rebuild emails
        contact.getEmails().clear();
        if (request.getEmails() != null) {
            for (ContactRequest.EmailRequest emailReq : request.getEmails()) {
                ContactEmail email = new ContactEmail();
                email.setLabel(emailReq.getLabel());
                email.setValue(emailReq.getValue());
                email.setContact(contact);
                contact.getEmails().add(email);
            }
        }

        // Clear and rebuild phones
        contact.getPhones().clear();
        if (request.getPhones() != null) {
            for (ContactRequest.PhoneRequest phoneReq : request.getPhones()) {
                ContactPhone phone = new ContactPhone();
                phone.setLabel(phoneReq.getLabel());
                phone.setValue(phoneReq.getValue());
                phone.setContact(contact);
                contact.getPhones().add(phone);
            }
        }

        Contact updatedContact = contactRepository.save(contact);
        log.info("Contact updated successfully with id: {}", updatedContact.getId());

        return mapToResponse(updatedContact);
    }

    @Transactional
    public void deleteContact(Long id) {
        log.info("Deleting contact with id: {}", id);
        User user = getCurrentUser();

        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new ContactNotFoundException(id));

        // Verify contact belongs to current user
        if (!contact.getUser().getId().equals(user.getId())) {
            log.warn("User {} attempted to delete contact {} belonging to another user", user.getId(), id);
            throw new ContactNotFoundException("Contact not found");
        }

        contactRepository.delete(contact);
        log.info("Contact deleted successfully with id: {}", id);
    }
}