package com.contactmanagement.controller;

import com.contactmanagement.dto.request.ContactRequest;
import com.contactmanagement.dto.response.ContactResponse;
import com.contactmanagement.service.ContactService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contacts")
@RequiredArgsConstructor
@Slf4j
public class ContactController {

    private final ContactService contactService;

    @PostMapping
    public ResponseEntity<ContactResponse> createContact(@Valid @RequestBody ContactRequest request) {
        log.info("Received request to create contact");
        ContactResponse response = contactService.createContact(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContactResponse> getContact(@PathVariable Long id) {
        log.info("Received request to get contact with id: {}", id);
        ContactResponse response = contactService.getContact(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Page<ContactResponse>> getContacts(
            @PageableDefault(size = 10, sort = "firstName") Pageable pageable) {
        log.info("Received request to get all contacts");
        Page<ContactResponse> contacts = contactService.getContacts(pageable);
        return ResponseEntity.ok(contacts);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ContactResponse>> searchContacts(
            @RequestParam
            @NotBlank(message = "Search query is required")
            @Size(max = 100, message = "Search query must be at most 100 characters")
            String query,
            @PageableDefault(size = 10, sort = "firstName") Pageable pageable) {
        log.info("Received request to search contacts with query: {}", query);
        Page<ContactResponse> contacts = contactService.searchContacts(query.trim(), pageable);
        return ResponseEntity.ok(contacts);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContactResponse> updateContact(
            @PathVariable Long id,
            @Valid @RequestBody ContactRequest request) {
        log.info("Received request to update contact with id: {}", id);
        ContactResponse response = contactService.updateContact(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContact(@PathVariable Long id) {
        log.info("Received request to delete contact with id: {}", id);
        contactService.deleteContact(id);
        return ResponseEntity.noContent().build();
    }
}