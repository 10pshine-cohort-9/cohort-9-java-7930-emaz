package com.contactmanagement.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class ContactRequest {

    @NotBlank(message = "First name is required")
    @Size(max = 50, message = "First name must be at most 50 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 50, message = "Last name must be at most 50 characters")
    private String lastName;

    @Size(max = 100, message = "Title must be at most 100 characters")
    private String title;

    @Valid
    private List<EmailRequest> emails;

    @Valid
    private List<PhoneRequest> phones;

    @Data
    public static class EmailRequest {
        @NotBlank(message = "Email label is required")
        private String label;

        @NotBlank(message = "Email value is required")
        @jakarta.validation.constraints.Email(message = "Invalid email format")
        private String value;
    }

    @Data
    public static class PhoneRequest {
        @NotBlank(message = "Phone label is required")
        private String label;

        @NotBlank(message = "Phone value is required")
        private String value;
    }
}