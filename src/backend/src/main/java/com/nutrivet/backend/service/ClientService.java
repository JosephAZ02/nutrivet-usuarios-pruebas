package com.nutrivet.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nutrivet.backend.domain.Client;
import com.nutrivet.backend.repository.ClientRepository;

@Service
public class ClientService {
    @Autowired
    private ClientRepository clientRepository;

    public List<Client> getAll() {
        return clientRepository.findAll();
    }

    public Optional<Client> getById(Integer id) {
        return clientRepository.findById(id);
    }

    public Client add(Client client) {
        return clientRepository.save(client);
    }

    public void deleteById(Integer id) {
        clientRepository.deleteById(id);
    }
}