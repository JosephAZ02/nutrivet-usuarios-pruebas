package com.nutrivet.backend.repository;

import java.util.List;
import java.util.Optional;
import com.nutrivet.backend.domain.ReceivableAccount;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

public interface ReceivableAccountRepository extends JpaRepository<ReceivableAccount, Integer> {

    // ¿el cliente tiene cuentas por cobrar? (lo usa ClientService antes de borrarlo)
    boolean existsByIdClient(String idClient);

    // cuentas de un cliente
    List<ReceivableAccount> findByIdClient(String idClient);

    // busca la cuenta bloqueándola mientras se registra un abono, igual que con los productos
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<ReceivableAccount> findWithLockById(Integer id);
}