package com.nutrivet.backend.repository;

import com.nutrivet.backend.domain.ClientInstallment;
import org.springframework.data.jpa.repository.JpaRepository;



public interface ClientInstallmentRepository extends JpaRepository<ClientInstallment, Integer> {
}
