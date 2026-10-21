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

import com.nutrivet.backend.domain.ClientInstallment;
import com.nutrivet.backend.service.ClientInstallmentService;

@RestController
@RequestMapping("/api/clientInstallment")
@CrossOrigin(origins = "*")
public class ClientInstallmentController {

    @Autowired
    private ClientInstallmentService clientInstallmentService;

    @GetMapping("/all")
    public List<ClientInstallment> getAllClientInstallments() {
        return clientInstallmentService.getAll();
    }

    @GetMapping("/get/{id}")
    public Optional<ClientInstallment> getClientInstallmentById(@PathVariable int id) {
        return clientInstallmentService.getById(id);
    }

    @PostMapping("/add")
    public ClientInstallment addClientInstallment(@RequestBody ClientInstallment clientInstallment) {
        return clientInstallmentService.add(clientInstallment);
    }

    @PutMapping("/update")
    public ClientInstallment updateClientInstallment(@RequestBody ClientInstallment clientInstallment) {
        return clientInstallmentService.add(clientInstallment);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteClientInstallment(@PathVariable int id) {
        clientInstallmentService.deleteById(id);
    }
}
