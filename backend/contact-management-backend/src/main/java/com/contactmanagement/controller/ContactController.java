package com.contactmanagement.controller;

import com.contactmanagement.dto.request.ContactRequest;
import com.contactmanagement.dto.response.ContactResponse;
import com.contactmanagement.dto.response.ImportResult;
import com.contactmanagement.service.ContactService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportContacts() {
        log.info("Received request to export contacts");

        try {
            String csv = contactService.exportContactsToCSV();
            byte[] csvBytes = csv.getBytes();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.TEXT_PLAIN);
            headers.setContentDispositionFormData("attachment", "contacts.csv");
            headers.setContentLength(csvBytes.length);

            return new ResponseEntity<>(csvBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Failed to export contacts: {}", e.getMessage());
            throw new RuntimeException("Failed to export contacts");
        }
    }

    @PostMapping("/import")
    public ResponseEntity<ImportResult> importContacts(@RequestParam("file") MultipartFile file) {
        log.info("Received request to import contacts from file: {}", file.getOriginalFilename());

        if (file.isEmpty()) {
            throw new RuntimeException("Please select a file to upload");
        }

        String fileName = file.getOriginalFilename();
        if (fileName == null || !fileName.endsWith(".csv")) {
            throw new RuntimeException("Please upload a CSV file");
        }

        ImportResult result = contactService.importContactsFromCSV(file);
        return ResponseEntity.ok(result);
    }
}