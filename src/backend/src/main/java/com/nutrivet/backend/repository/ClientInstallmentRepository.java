package com.nutrivet.backend.repository;

import java.util.List;
import com.nutrivet.backend.domain.ClientInstallment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientInstallmentRepository extends JpaRepository<ClientInstallment, Integer> {

    // historial de abonos de una cuenta, del primero al último
    List<ClientInstallment> findByIdReceivableAccountOrderByIdAsc(int idReceivableAccount);
}