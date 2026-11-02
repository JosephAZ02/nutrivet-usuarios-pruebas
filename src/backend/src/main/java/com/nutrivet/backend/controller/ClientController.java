package com.nutrivet.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('CLIENT_GET_ALL')")
    public ResponseEntity<?> getAllClients() {
        try {
            return ResponseEntity.ok(clientService.getAll());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al consultar los clientes");
        }
    }

    @GetMapping("/get/{id}")
    @PreAuthorize("hasAuthority('CLIENT_GET_BY_ID')")
    public ResponseEntity<?> getClientById(@PathVariable String id) {
        try {
            return clientService.getById(id).<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("El cliente no existe"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al consultar el cliente");
        }
    }

    @PostMapping("/add")
    @PreAuthorize("hasAuthority('CLIENT_CREATE')")
    public ResponseEntity<?> addClient(@RequestBody Client client) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(clientService.add(client));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasAuthority('CLIENT_UPDATE')")
    public ResponseEntity<?> updateClient(@PathVariable String id, @RequestBody Client client) {
        try {
            return ResponseEntity.ok(clientService.update(id, client));
        } catch (RuntimeException e) {
            if ("El cliente no existe".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
            }
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAuthority('CLIENT_DELETE')")
    public ResponseEntity<?> deleteClient(@PathVariable String id) {
        try {
            clientService.deleteById(id);
            return ResponseEntity.ok("El cliente fue eliminado exitosamente");
        } catch (RuntimeException e) {
            if ("El cliente no existe".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
            }
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}