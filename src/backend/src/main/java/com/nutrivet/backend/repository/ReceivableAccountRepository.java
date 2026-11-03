package com.nutrivet.backend.repository;

import java.util.List;
import java.util.Optional;
import com.nutrivet.backend.domain.ReceivableAccount;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

public interface ReceivableAccountRepository extends JpaRepository<ReceivableAccount, Integer> {


    boolean existsByIdClient(String idClient);

    
    List<ReceivableAccount> findByIdClient(String idClient);


    Optional<ReceivableAccount> findByIdInvoice(int idInvoice);


    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<ReceivableAccount> findWithLockById(Integer id);
}