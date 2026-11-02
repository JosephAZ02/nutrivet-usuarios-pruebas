package com.nutrivet.backend.service;

import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import com.nutrivet.backend.domain.Role;
import com.nutrivet.backend.repository.RoleRepository;

@Service
public class RoleService {

   
    private final RoleRepository roleRepository;
    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    public List<Role> getAll() {
        return roleRepository.findAll();
    }

    public Optional<Role> getById(Integer id) {
        return roleRepository.findById(id);
    }

    public Role add(Role role) {
        return roleRepository.save(role);
    }

    public void deleteById(Integer id) {
        if (id == 1) {
            throw new RuntimeException("No se puede eliminar el rol de Administrador.");
        }
        roleRepository.deleteById(id);
    }
}
