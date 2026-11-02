package com.nutrivet.backend.repository;

import com.nutrivet.backend.domain.SupplierInvoice;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierInvoiceRepository extends JpaRepository<SupplierInvoice, Integer> {

    boolean existsByElectronicKey(String electronicKey);
}
