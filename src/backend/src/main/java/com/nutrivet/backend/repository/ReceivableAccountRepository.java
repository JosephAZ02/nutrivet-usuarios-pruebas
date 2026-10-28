package com.nutrivet.backend.repository;

import com.nutrivet.backend.domain.ReceivableAccount;
import org.springframework.data.jpa.repository.JpaRepository;


public interface ReceivableAccountRepository extends JpaRepository<ReceivableAccount, Integer> {
}
