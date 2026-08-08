package com.contactmanagement.controller;

import com.contactmanagement.dto.request.ContactRequest;
import com.contactmanagement.dto.response.ContactResponse;
import com.contactmanagement.exception.ContactNotFoundException;
import com.contactmanagement.security.JwtTokenProvider;
import com.contactmanagement.service.ContactService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ContactController.class)
@AutoConfigureMockMvc(addFilters = false)
class ContactControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ContactService contactService;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private ObjectMapper objectMapper;

    // ========== CREATE CONTACT TESTS ==========

    @Test
    void shouldCreateContactSuccessfully() throws Exception {
        ContactRequest request = new ContactRequest();
        request.setFirstName("Ahmed");
        request.setLastName("Khan");
        request.setTitle("Software Engineer");

        ContactResponse response = ContactResponse.builder()
                .id(1L)
                .firstName("Ahmed")
                .lastName("Khan")
                .title("Software Engineer")
                .build();

        when(contactService.createContact(any(ContactRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.firstName").value("Ahmed"))
                .andExpect(jsonPath("$.lastName").value("Khan"));
    }

    @Test
    void shouldReturnBadRequestForInvalidContact() throws Exception {
        ContactRequest request = new ContactRequest();

        mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // ========== GET CONTACT TESTS ==========

    @Test
    void shouldGetContactSuccessfully() throws Exception {
        ContactResponse response = ContactResponse.builder()
                .id(1L)
                .firstName("Ahmed")
                .lastName("Khan")
                .title("Software Engineer")
                .build();

        when(contactService.getContact(1L)).thenReturn(response);

        mockMvc.perform(get("/api/contacts/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.firstName").value("Ahmed"));
    }

    @Test
    void shouldReturnNotFoundWhenContactDoesNotExist() throws Exception {
        when(contactService.getContact(999L))
                .thenThrow(new ContactNotFoundException("Contact not found with id: 999"));

        mockMvc.perform(get("/api/contacts/999"))
                .andExpect(status().isNotFound());
    }

    // ========== GET ALL CONTACTS TESTS ==========

    @Test
    void shouldGetAllContactsSuccessfully() throws Exception {
        ContactResponse response = ContactResponse.builder()
                .id(1L)
                .firstName("Ahmed")
                .lastName("Khan")
                .title("Software Engineer")
                .build();

        Page<ContactResponse> page = new PageImpl<>(Collections.singletonList(response), PageRequest.of(0, 10), 1);

        when(contactService.getContacts(any(PageRequest.class))).thenReturn(page);

        mockMvc.perform(get("/api/contacts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].firstName").value("Ahmed"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    // ========== SEARCH CONTACTS TESTS ==========

    @Test
    void shouldSearchContactsSuccessfully() throws Exception {
        ContactResponse response = ContactResponse.builder()
                .id(1L)
                .firstName("Ahmed")
                .lastName("Khan")
                .title("Software Engineer")
                .build();

        Page<ContactResponse> page = new PageImpl<>(Collections.singletonList(response), PageRequest.of(0, 10), 1);

        when(contactService.searchContacts(eq("Ahmed"), any(PageRequest.class))).thenReturn(page);

        mockMvc.perform(get("/api/contacts/search?query=Ahmed"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].firstName").value("Ahmed"));
    }

    // ========== UPDATE CONTACT TESTS ==========

    @Test
    void shouldUpdateContactSuccessfully() throws Exception {
        ContactRequest request = new ContactRequest();
        request.setFirstName("Updated");
        request.setLastName("Name");
        request.setTitle("Senior Engineer");

        ContactResponse response = ContactResponse.builder()
                .id(1L)
                .firstName("Updated")
                .lastName("Name")
                .title("Senior Engineer")
                .build();

        when(contactService.updateContact(eq(1L), any(ContactRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/contacts/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Updated"))
                .andExpect(jsonPath("$.title").value("Senior Engineer"));
    }

    // ========== DELETE CONTACT TESTS ==========

    @Test
    void shouldDeleteContactSuccessfully() throws Exception {
        doNothing().when(contactService).deleteContact(1L);

        mockMvc.perform(delete("/api/contacts/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void shouldReturnNotFoundWhenDeletingNonExistentContact() throws Exception {
        doNothing().when(contactService).deleteContact(999L);

        mockMvc.perform(delete("/api/contacts/999"))
                .andExpect(status().isNoContent());
    }
}