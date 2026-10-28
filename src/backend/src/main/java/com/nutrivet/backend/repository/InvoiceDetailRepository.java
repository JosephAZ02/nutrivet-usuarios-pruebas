package com.nutrivet.backend.repository;

import com.nutrivet.backend.domain.InvoiceDetail;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;



public interface InvoiceDetailRepository extends JpaRepository<InvoiceDetail, Integer> {

     List<InvoiceDetail> findByIdInvoice(int idInvoice);

}
