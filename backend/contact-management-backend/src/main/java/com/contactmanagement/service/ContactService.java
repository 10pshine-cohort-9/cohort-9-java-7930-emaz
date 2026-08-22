package com.contactmanagement.service;

import com.contactmanagement.dto.request.ContactRequest;
import com.contactmanagement.dto.response.ContactResponse;
import com.contactmanagement.dto.response.ImportResult;
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
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
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

        // Guard against null or anonymous authentication
        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("Authentication is null or not authenticated");
            throw new RuntimeException("User not authenticated");
        }

        String email = authentication.getName();
        if ("anonymousUser".equals(email) || email == null) {
            log.warn("Anonymous user or null email");
            throw new RuntimeException("User not authenticated");
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("User not found with email: {}", email);
                    return new UsernameNotFoundException("User not found");
                });
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

    @Transactional(readOnly = true)
    public String exportContactsToCSV() {
        log.info("Exporting contacts to CSV for current user");
        User user = getCurrentUser();
        List<Contact> contacts = contactRepository.findByUserId(user.getId());

        StringBuilder csv = new StringBuilder();

        // Header with all fields
        csv.append("First Name,Last Name,Title,Email (Label:Value),Phone (Label:Value)\n");

        for (Contact contact : contacts) {
            // Format: label:value; label:value
            String emails = contact.getEmails().stream()
                    .map(e -> e.getLabel() + ":" + e.getValue())
                    .collect(Collectors.joining("; "));

            String phones = contact.getPhones().stream()
                    .map(p -> p.getLabel() + ":" + p.getValue())
                    .collect(Collectors.joining("; "));

            csv.append(escapeCSV(contact.getFirstName())).append(",")
                    .append(escapeCSV(contact.getLastName())).append(",")
                    .append(escapeCSV(contact.getTitle() != null ? contact.getTitle() : "")).append(",")
                    .append(escapeCSV(emails)).append(",")
                    .append(escapeCSV(phones)).append("\n");
        }

        log.info("Exported {} contacts to CSV", contacts.size());
        return csv.toString();
    }

    private String escapeCSV(String value) {
        if (value == null) return "";

        String trimmed = value.trim();
        if (trimmed.startsWith("=") || trimmed.startsWith("+") ||
                trimmed.startsWith("-") || trimmed.startsWith("@")) {
            value = "'" + value;
        }

        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    @Transactional
    public ImportResult importContactsFromCSV(MultipartFile file) {
        log.info("Importing contacts from CSV file: {}", file.getOriginalFilename());
        User user = getCurrentUser();

        int successCount = 0;
        int failureCount = 0;
        List<String> errors = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line = reader.readLine();

            int rowNumber = 1;
            while ((line = reader.readLine()) != null) {
                rowNumber++;
                try {
                    String[] fields = parseCSVLine(line);
                    if (fields.length < 5) {
                        errors.add("Row " + rowNumber + ": Invalid format (expected 5 columns)");
                        failureCount++;
                        continue;
                    }

                    Contact contact = new Contact();
                    contact.setFirstName(fields[0].trim());
                    contact.setLastName(fields[1].trim());
                    contact.setTitle(fields[2].trim());
                    contact.setUser(user);

                    // Parse emails: label:value; label:value
                    if (!fields[3].trim().isEmpty()) {
                        String[] emailParts = fields[3].split(";");
                        for (String part : emailParts) {
                            String[] kv = part.trim().split(":", 2);
                            if (kv.length == 2) {
                                ContactEmail email = new ContactEmail();
                                email.setLabel(kv[0].trim());
                                email.setValue(kv[1].trim());
                                email.setContact(contact);
                                contact.getEmails().add(email);
                            }
                        }
                    }

                    // Parse phones: label:value; label:value
                    if (!fields[4].trim().isEmpty()) {
                        String[] phoneParts = fields[4].split(";");
                        for (String part : phoneParts) {
                            String[] kv = part.trim().split(":", 2);
                            if (kv.length == 2) {
                                ContactPhone phone = new ContactPhone();
                                phone.setLabel(kv[0].trim());
                                phone.setValue(kv[1].trim());
                                phone.setContact(contact);
                                contact.getPhones().add(phone);
                            }
                        }
                    }

                    contactRepository.save(contact);
                    successCount++;

                } catch (Exception e) {
                    log.error("Failed to import row {}: {}", rowNumber, e.getMessage());
                    errors.add("Row " + rowNumber + ": " + e.getMessage());
                    failureCount++;
                }
            }

        } catch (Exception e) {
            log.error("Failed to import contacts", e);
            throw new RuntimeException("Failed to import contacts: " + e.getMessage());
        }

        log.info("Imported {} contacts successfully, {} failed", successCount, failureCount);
        return new ImportResult(successCount, failureCount, errors);
    }

    private String[] parseCSVLine(String line) {
        List<String> result = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;

        for (char c : line.toCharArray()) {
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                result.add(current.toString().trim());
                current = new StringBuilder();
            } else {
                current.append(c);
            }
        }
        result.add(current.toString().trim());
        return result.toArray(new String[0]);
    }
}