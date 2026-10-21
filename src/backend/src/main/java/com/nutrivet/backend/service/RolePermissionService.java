package com.nutrivet.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nutrivet.backend.domain.RolePermission;
import com.nutrivet.backend.repository.RolePermissionRepository;

@Service
public class RolePermissionService {

    @Autowired
    private RolePermissionRepository rolePermissionRepository;

    public List<RolePermission> getAll() {
        return rolePermissionRepository.findAll();
    }

    public Optional<RolePermission> getById(Integer id) {
        return rolePermissionRepository.findById(id);
    }

    public RolePermission add(RolePermission rolePermission) {
        return rolePermissionRepository.save(rolePermission);
    }

    public void deleteById(Integer id) {
        rolePermissionRepository.deleteById(id);
    }
}
