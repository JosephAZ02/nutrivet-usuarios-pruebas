package com.nutrivet.backend.service;

import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import com.nutrivet.backend.domain.Client;
import com.nutrivet.backend.repository.ClientRepository;
import com.nutrivet.backend.repository.ReceivableAccountRepository;

@Service
public class ClientService {

    private final ClientRepository clientRepository;
    private final ReceivableAccountRepository receivableAccountRepository;

    public ClientService(ClientRepository clientRepository, ReceivableAccountRepository receivableAccountRepository) {
        this.clientRepository = clientRepository;
        this.receivableAccountRepository = receivableAccountRepository;
    }

    // Valida los datos y los deja limpios (sin espacios de más)
    private void validateClient(Client client) {
        if (client == null) {
            throw new RuntimeException("Los datos del cliente son obligatorios");
        }

        if (client.getId() == null || !client.getId().trim().matches("[0-9]{9,12}")) {
            throw new RuntimeException("La cédula debe tener entre 9 y 12 dígitos, sin guiones ni espacios");
        }

        if (client.getName() == null || client.getName().trim().isEmpty()) {
            throw new RuntimeException("El nombre del cliente es obligatorio");
        }

        if (client.getPhone() == null || !client.getPhone().replaceAll("[^0-9]", "").matches("[0-9]{8}")) {
            throw new RuntimeException("El teléfono debe tener 8 dígitos");
        }

        // el correo es opcional, pero si se escribe debe tener forma de correo
        String email = client.getEmail();
        if (email == null || email.trim().isEmpty()) {
            client.setEmail(null);
        } else if (!email.trim().matches("[^@\\s]+@[^@\\s]+\\.[^@\\s]+")) {
            throw new RuntimeException("El correo no es válido");
        } else {
            client.setEmail(email.trim());
        }

        client.setId(client.getId().trim());
        client.setName(client.getName().trim());
        client.setPhone(client.getPhone().trim());
    }

    public List<Client> getAll() {
        return clientRepository.findAll();
    }

    public Optional<Client> getById(String id) {
        if (id == null) {
            return Optional.empty();
        }
        return clientRepository.findById(id.trim());
    }

    public Client add(Client client) {
        validateClient(client);

        // como la cédula la escribe el usuario, save() pisaría al cliente existente si
        // no se revisa
        if (clientRepository.existsById(client.getId())) {
            throw new RuntimeException("Ya existe un cliente con esa cédula");
        }

        return clientRepository.save(client);
    }

    public Client update(String id, Client client) {
        if (client != null) {
            client.setId(id); // la cédula no se cambia: manda la de la dirección
        }
        validateClient(client);

        Client existing = clientRepository.findById(client.getId())
                .orElseThrow(() -> new RuntimeException("El cliente no existe"));

        existing.setName(client.getName());
        existing.setPhone(client.getPhone());
        existing.setEmail(client.getEmail());

        return clientRepository.save(existing);
    }

    public void deleteById(String id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("El cliente no existe"));

        // un cliente con cuentas por cobrar no se puede borrar
        if (receivableAccountRepository.existsByIdClient(client.getId())) {
            throw new RuntimeException("El cliente tiene cuentas por cobrar y no se puede eliminar");
        }

        clientRepository.deleteById(id);
    }
}