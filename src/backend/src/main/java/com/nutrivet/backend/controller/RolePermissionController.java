package com.nutrivet.backend.controller;

import java.util.List;
import java.util.Optional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.nutrivet.backend.domain.RolePermission;
import com.nutrivet.backend.service.RolePermissionService;

@RestController
@RequestMapping("/api/rolePermission")
@CrossOrigin(origins = "*")
public class RolePermissionController {

    private final RolePermissionService rolePermissionService;
    public RolePermissionController(RolePermissionService rolePermissionService) {
        this.rolePermissionService = rolePermissionService;
    }

    @GetMapping("/all")
    public List<RolePermission> getAllRolePermissions() {
        return rolePermissionService.getAll();
    }

    @GetMapping("/get/{id}")
    public Optional<RolePermission> getRolePermissionById(@PathVariable int id) {
        return rolePermissionService.getById(id);
    }

    @PostMapping("/add")
    public RolePermission addRolePermission(@RequestBody RolePermission rolePermission) {
        return rolePermissionService.add(rolePermission);
    }

    @PutMapping("/update")
    public RolePermission updateRolePermission(@RequestBody RolePermission rolePermission) {
        return rolePermissionService.add(rolePermission);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteRolePermission(@PathVariable int id) {
        rolePermissionService.deleteById(id);
    }
}
