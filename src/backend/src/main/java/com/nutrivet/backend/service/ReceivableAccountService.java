package com.nutrivet.backend.service;

import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import com.nutrivet.backend.domain.ReceivableAccount;
import com.nutrivet.backend.repository.ReceivableAccountRepository;

@Service
public class ReceivableAccountService {

    private final ReceivableAccountRepository receivableAccountRepository;
    public ReceivableAccountService(ReceivableAccountRepository receivableAccountRepository) {
        this.receivableAccountRepository = receivableAccountRepository;
    }

    public List<ReceivableAccount> getAll() {
        return receivableAccountRepository.findAll();
    }

    public Optional<ReceivableAccount> getById(Integer id) {
        return receivableAccountRepository.findById(id);
    }

        
    public Optional<ReceivableAccount> getByInvoiceId(int idInvoice) {
        return receivableAccountRepository.findByIdInvoice(idInvoice);
    }

    public ReceivableAccount add(ReceivableAccount receivableAccount) {
        return receivableAccountRepository.save(receivableAccount);
    }

    public void deleteById(Integer id) {
        receivableAccountRepository.deleteById(id);
    }
}
