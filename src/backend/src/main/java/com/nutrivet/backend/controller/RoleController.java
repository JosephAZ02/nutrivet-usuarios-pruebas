package com.nutrivet.backend.controller;

import java.util.List;
import java.util.Optional;

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
import com.nutrivet.backend.domain.Role;
import com.nutrivet.backend.service.RoleService;

@RestController
@RequestMapping("/api/role")
@CrossOrigin(origins = "*")
public class RoleController {

    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('USER_CREATE')")
    public List<Role> getAllRoles() {
        return roleService.getAll();
    }

    @GetMapping("/get/{id}")
    public Optional<Role> getRoleById(@PathVariable int id) {
        return roleService.getById(id);
    }

    @PostMapping("/add")
    @PreAuthorize("hasAuthority('USER_CREATE')")
    public org.springframework.http.ResponseEntity<?> createRole(
            @RequestBody com.nutrivet.backend.dto.RoleRequest request) {
        com.nutrivet.backend.domain.Role role = new com.nutrivet.backend.domain.Role();
        role.setName(request.getName());
        role.setDescription(request.getDescription());
        roleService.add(role);
        return org.springframework.http.ResponseEntity.ok("Rol creado correctamente");
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasAuthority('USER_CREATE')")
    public org.springframework.http.ResponseEntity<?> updateRole(@PathVariable int id,
            @RequestBody com.nutrivet.backend.dto.RoleRequest request) {
        com.nutrivet.backend.domain.Role role = roleService.getById(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
        role.setName(request.getName());
        role.setDescription(request.getDescription());
        roleService.add(role);
        return org.springframework.http.ResponseEntity.ok("Rol actualizado correctamente");
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAuthority('USER_CREATE')")
    public org.springframework.http.ResponseEntity<?> deleteRole(@PathVariable int id) {
        roleService.deleteById(id);
        return org.springframework.http.ResponseEntity.ok("Rol eliminado correctamente");
    }
}
