package com.contactmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String title;
    private List<EmailResponse> emails;
    private List<PhoneResponse> phones;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmailResponse {
        private Long id;
        private String label;
        private String value;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PhoneResponse {
        private Long id;
        private String label;
        private String value;
    }
}