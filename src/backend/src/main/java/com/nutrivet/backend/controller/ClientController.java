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

import com.nutrivet.backend.domain.Client;
import com.nutrivet.backend.service.ClientService;

@RestController
@RequestMapping("/api/client")
@CrossOrigin(origins = "*")
public class ClientController {

    @Autowired
    private ClientService clientService;

    @GetMapping("/all")
    public List<Client> getAllClients() {
        return clientService.getAll();
    }

    @GetMapping("/get/{id}")
    public Optional<Client> getClientById(@PathVariable int id) {
        return clientService.getById(id);
    }

    @PostMapping("/add")
    public Client addClient(@RequestBody Client client) {
        return clientService.add(client);
    }

    @PutMapping("/update")
    public Client updateClient(@RequestBody Client client) {
        return clientService.add(client);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteClient(@PathVariable int id) {
        clientService.deleteById(id);
    }
}
