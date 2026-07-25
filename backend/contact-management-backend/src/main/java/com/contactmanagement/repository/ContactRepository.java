package com.contactmanagement.repository;

import com.contactmanagement.entity.Contact;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {

    Page<Contact> findByUserId(Long userId, Pageable pageable);

    @Query("SELECT c FROM Contact c WHERE c.user.id = :userId AND " +
            "(LOWER(c.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(c.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Contact> searchContacts(@Param("userId") Long userId,
                                 @Param("search") String search,
                                 Pageable pageable);

    List<Contact> findByUserId(Long userId);
}