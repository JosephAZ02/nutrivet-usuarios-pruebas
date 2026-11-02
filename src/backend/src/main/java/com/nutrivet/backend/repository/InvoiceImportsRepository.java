package com.nutrivet.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nutrivet.backend.domain.InvoiceImports;

public interface InvoiceImportsRepository extends JpaRepository<InvoiceImports, Integer> {

    boolean existsByMessageId(String messageId);

    Optional<InvoiceImports> findByElectronicKey(String electronicKey);
}