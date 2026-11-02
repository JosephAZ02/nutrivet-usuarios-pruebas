package com.nutrivet.backend.repository;

import java.util.List;

import com.nutrivet.backend.domain.SupplierPayment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierPaymentRepository extends JpaRepository<SupplierPayment, Integer> {

    List<SupplierPayment> findByIdSupplierInvoice(Integer idSupplierInvoice);
}
