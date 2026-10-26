package com.nutrivet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nutrivet.backend.domain.Invoice;

@Repository
public interface ReportRepository extends JpaRepository<Invoice, Integer> {

}
