package com.contactmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImportResult {
    private int successCount;
    private int failureCount;
    private List<String> errors;
    private String message;

    public ImportResult(int successCount, int failureCount, List<String> errors) {
        this.successCount = successCount;
        this.failureCount = failureCount;
        this.errors = errors;
        this.message = String.format("Imported %d contacts, %d failed", successCount, failureCount);
    }
}