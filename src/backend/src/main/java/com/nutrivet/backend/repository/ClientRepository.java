package com.nutrivet.backend.repository;

import com.nutrivet.backend.domain.Client;
import org.springframework.data.jpa.repository.JpaRepository;


public interface ClientRepository extends JpaRepository<Client, String> {
}
