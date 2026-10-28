package com.nutrivet.backend.service;

import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import com.nutrivet.backend.domain.Supplier;
import com.nutrivet.backend.repository.SupplierRepository;

@Service
public class SupplierService {

    
    private final SupplierRepository supplierRepository;
    public SupplierService(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;
    }

    public List<Supplier> getAll() {
        return supplierRepository.findAll();
    }

    public Optional<Supplier> getById(Integer id) {
        return supplierRepository.findById(id);
    }

    public Supplier add(Supplier supplier) {
        return supplierRepository.save(supplier);
    }

    public void deleteById(Integer id) {
        supplierRepository.deleteById(id);
    }
}
