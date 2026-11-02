package com.nutrivet.backend.repository;

import com.nutrivet.backend.domain.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierRepository extends JpaRepository<Supplier, Integer> {

    Supplier findByIdentificationNumber(String identificationNumber);
}
