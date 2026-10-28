package com.nutrivet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.nutrivet.backend.domain.Invoice;

public interface ReportRepository extends JpaRepository<Invoice, Integer> {

}
