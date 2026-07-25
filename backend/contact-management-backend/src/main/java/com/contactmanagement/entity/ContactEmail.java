package com.contactmanagement.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "contact_emails")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(onlyExplicitlyIncluded = true)
public class ContactEmail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @ToString.Include
    private Long id;

    private String email;
    private String emailType;

    @ManyToOne
    @JoinColumn(name = "contact_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Contact contact;
}