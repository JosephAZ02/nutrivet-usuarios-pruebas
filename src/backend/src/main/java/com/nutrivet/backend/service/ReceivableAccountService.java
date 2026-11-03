package com.nutrivet.backend.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.nutrivet.backend.domain.ClientInstallment;
import com.nutrivet.backend.domain.ReceivableAccount;
import com.nutrivet.backend.dto.InstallmentRequest;
import com.nutrivet.backend.dto.ReceivableAccountResponse;
import com.nutrivet.backend.repository.ReceivableAccountRepository;

@Service
public class ReceivableAccountService {

    private final ReceivableAccountRepository receivableAccountRepository;
    private final ClientInstallmentService clientInstallmentService;
    private final ClientService clientService;
    private final InvoiceService invoiceService;

    public ReceivableAccountService(ReceivableAccountRepository receivableAccountRepository,
            ClientInstallmentService clientInstallmentService, ClientService clientService,
            InvoiceService invoiceService) {
        this.receivableAccountRepository = receivableAccountRepository;
        this.clientInstallmentService = clientInstallmentService;
        this.clientService = clientService;
        this.invoiceService = invoiceService;
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


    // todas las cuentas, con el nombre del cliente y su estado
    public List<ReceivableAccountResponse> getAccounts() {
        return toResponses(receivableAccountRepository.findAll());
    }

    // las cuentas de un cliente
    public List<ReceivableAccountResponse> getAccountsByClient(String clientId) {
        return toResponses(receivableAccountRepository.findByIdClient(clientId));
    }

    // el detalle de una cuenta
    public ReceivableAccountResponse getAccount(int id) {
        ReceivableAccount account = receivableAccountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("La cuenta por cobrar no existe"));
        return toResponse(account);
    }

    // historial de abonos de una cuenta (el primero puede ser el abono inicial de la venta)
    public List<ClientInstallment> getInstallments(int accountId) {
        if (!receivableAccountRepository.existsById(accountId)) {
            throw new RuntimeException("La cuenta por cobrar no existe");
        }
        return clientInstallmentService.getByReceivableAccountId(accountId);
    }


    // Si algo falla, no se guarda nada. La cuenta se bloquea mientras se registra,
    // para que dos abonos al mismo tiempo no se pisen.
    @Transactional
    public ReceivableAccountResponse registerInstallment(InstallmentRequest request) {
        double amount = round(request.amount());
        if (Double.isNaN(request.amount()) || Double.isInfinite(request.amount()) || amount <= 0) {
            throw new RuntimeException("El monto del abono debe ser mayor a cero");
        }

        ReceivableAccount account = receivableAccountRepository.findWithLockById(request.accountId())
                .orElseThrow(() -> new RuntimeException("La cuenta por cobrar no existe"));

        double balance = round(account.getCurrentAmount());
        if (balance <= 0) {
            throw new RuntimeException("La cuenta ya está pagada");
        }
        if (amount > balance) {
            throw new RuntimeException("El abono no puede ser mayor al saldo pendiente");
        }

        account.setCurrentAmount(round(balance - amount));
        receivableAccountRepository.save(account);

        ClientInstallment installment = new ClientInstallment();
        installment.setAmount(amount);
        installment.setInstallmentDate(LocalDate.now());
        installment.setIdReceivableAccount(account.getId());
        installment.setIdClient(account.getIdClient());
        clientInstallmentService.add(installment);

        return toResponse(account);
    }

    // redondea a 2 decimales para que los saldos no arrastren errores de punto flotante
    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private List<ReceivableAccountResponse> toResponses(List<ReceivableAccount> accounts) {
        List<ReceivableAccountResponse> responses = new ArrayList<>();
        for (ReceivableAccount account : accounts) {
            responses.add(toResponse(account));
        }
        return responses;
    }

    private ReceivableAccountResponse toResponse(ReceivableAccount account) {
        String invoiceNumber = invoiceService.getById(account.getIdInvoice())
                .map(invoice -> invoice.getNumber()).orElse("");
        String clientName = clientService.getById(account.getIdClient())
                .map(client -> client.getName()).orElse("");

        double balance = round(account.getCurrentAmount());

        String status = "PENDIENTE";
        if (balance <= 0) {
            status = "PAGADA";
        } else if (account.getDueDate() != null && account.getDueDate().isBefore(LocalDate.now())) {
            status = "VENCIDA";
        }

        return new ReceivableAccountResponse(
                account.getId(),
                account.getIdInvoice(),
                invoiceNumber,
                account.getIdClient(),
                clientName,
                account.getTotalAmount(),
                round(account.getTotalAmount() - balance),
                balance,
                account.getMonthlyInstallment(),
                account.getDueDate(),
                status);
    }
}