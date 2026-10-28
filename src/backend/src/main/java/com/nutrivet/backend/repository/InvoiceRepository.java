package com.nutrivet.backend.repository;

import com.nutrivet.backend.domain.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;



public interface InvoiceRepository extends JpaRepository<Invoice, Integer> {
}
