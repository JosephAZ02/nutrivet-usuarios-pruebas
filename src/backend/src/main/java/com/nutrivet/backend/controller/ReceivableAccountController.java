package com.nutrivet.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.nutrivet.backend.dto.InstallmentRequest;
import com.nutrivet.backend.service.ReceivableAccountService;

@RestController
@RequestMapping("/api/receivableAccount")
@CrossOrigin(origins = "*")
public class ReceivableAccountController {

    private final ReceivableAccountService receivableAccountService;

    public ReceivableAccountController(ReceivableAccountService receivableAccountService) {
        this.receivableAccountService = receivableAccountService;
    }

    
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('RECEIVABLE_ACCOUNT_GET_ALL')")
    public ResponseEntity<?> getAllAccounts() {
        try {
            return ResponseEntity.ok(receivableAccountService.getAccounts());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al consultar las cuentas por cobrar");
        }
    }


    @GetMapping("/get/{id}")
    @PreAuthorize("hasAuthority('RECEIVABLE_ACCOUNT_GET_BY_ID')")
    public ResponseEntity<?> getAccountById(@PathVariable int id) {
        try {
            return ResponseEntity.ok(receivableAccountService.getAccount(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

   
    @GetMapping("/client/{clientId}")
    @PreAuthorize("hasAuthority('RECEIVABLE_ACCOUNT_GET_ALL')")
    public ResponseEntity<?> getAccountsByClient(@PathVariable String clientId) {
        try {
            return ResponseEntity.ok(receivableAccountService.getAccountsByClient(clientId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al consultar las cuentas del cliente");
        }
    }

  
    @GetMapping("/installments/{id}")
    @PreAuthorize("hasAuthority('RECEIVABLE_ACCOUNT_GET_BY_ID')")
    public ResponseEntity<?> getInstallments(@PathVariable int id) {
        try {
            return ResponseEntity.ok(receivableAccountService.getInstallments(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    
    @PostMapping("/installment")
    @PreAuthorize("hasAuthority('INSTALLMENT_CREATE')")
    public ResponseEntity<?> registerInstallment(@RequestBody InstallmentRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(receivableAccountService.registerInstallment(request));
        } catch (RuntimeException e) {
            if ("La cuenta por cobrar no existe".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
            }
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}