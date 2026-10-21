package com.nutrivet.backend.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nutrivet.backend.domain.ReceivableAccount;
import com.nutrivet.backend.service.ReceivableAccountService;

@RestController
@RequestMapping("/api/receivableAccount")
@CrossOrigin(origins = "*")
public class ReceivableAccountController {

    @Autowired
    private ReceivableAccountService receivableAccountService;

    @GetMapping("/all")
    public List<ReceivableAccount> getAllReceivableAccounts() {
        return receivableAccountService.getAll();
    }

    @GetMapping("/get/{id}")
    public Optional<ReceivableAccount> getReceivableAccountById(@PathVariable int id) {
        return receivableAccountService.getById(id);
    }

    @PostMapping("/add")
    public ReceivableAccount addReceivableAccount(@RequestBody ReceivableAccount receivableAccount) {
        return receivableAccountService.add(receivableAccount);
    }

    @PutMapping("/update")
    public ReceivableAccount updateReceivableAccount(@RequestBody ReceivableAccount receivableAccount) {
        return receivableAccountService.add(receivableAccount);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteReceivableAccount(@PathVariable int id) {
        receivableAccountService.deleteById(id);
    }
}
