package com.nutrivet.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nutrivet.backend.domain.Permission;
import com.nutrivet.backend.repository.PermissionRepository;

@Service
public class PermissionService {

    @Autowired
    private PermissionRepository permissionRepository;

    public List<Permission> getAll() {
        return permissionRepository.findAll();
    }

    public Optional<Permission> getById(Integer id) {
        return permissionRepository.findById(id);
    }

    public Permission add(Permission permission) {
        return permissionRepository.save(permission);
    }

    public void deleteById(Integer id) {
        permissionRepository.deleteById(id);
    }
}
