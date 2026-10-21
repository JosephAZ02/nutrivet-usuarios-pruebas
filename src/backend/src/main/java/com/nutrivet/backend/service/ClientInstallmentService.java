package com.nutrivet.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nutrivet.backend.domain.ClientInstallment;
import com.nutrivet.backend.repository.ClientInstallmentRepository;

@Service
public class ClientInstallmentService {

    @Autowired
    private ClientInstallmentRepository clientInstallmentRepository;

    public List<ClientInstallment> getAll() {
        return clientInstallmentRepository.findAll();
    }

    public Optional<ClientInstallment> getById(Integer id) {
        return clientInstallmentRepository.findById(id);
    }

    public ClientInstallment add(ClientInstallment clientInstallment) {
        return clientInstallmentRepository.save(clientInstallment);
    }

    public void deleteById(Integer id) {
        clientInstallmentRepository.deleteById(id);
    }
}
