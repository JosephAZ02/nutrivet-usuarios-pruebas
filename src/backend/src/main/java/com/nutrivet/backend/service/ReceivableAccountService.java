package com.nutrivet.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nutrivet.backend.domain.ReceivableAccount;
import com.nutrivet.backend.repository.ReceivableAccountRepository;

@Service
public class ReceivableAccountService {

    @Autowired
    private ReceivableAccountRepository receivableAccountRepository;

    public List<ReceivableAccount> getAll() {
        return receivableAccountRepository.findAll();
    }

    public Optional<ReceivableAccount> getById(Integer id) {
        return receivableAccountRepository.findById(id);
    }

    public ReceivableAccount add(ReceivableAccount receivableAccount) {
        return receivableAccountRepository.save(receivableAccount);
    }

    public void deleteById(Integer id) {
        receivableAccountRepository.deleteById(id);
    }
}
