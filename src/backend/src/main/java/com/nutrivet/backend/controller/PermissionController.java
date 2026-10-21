package com.nutrivet.backend.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nutrivet.backend.domain.Permission;
import com.nutrivet.backend.service.PermissionService;

@RestController
@RequestMapping("/api/permission")
@CrossOrigin(origins = "*")
public class PermissionController {

    @Autowired
    private PermissionService permissionService;

    @GetMapping("/all")
    public List<Permission> getAllPermissions() {
        return permissionService.getAll();
    }

    @GetMapping("/get/{id}")
    public Optional<Permission> getPermissionById(@PathVariable int id) {
        return permissionService.getById(id);
    }

    @PostMapping("/add")
    public Permission addPermission(@RequestBody Permission permission) {
        return permissionService.add(permission);
    }

    @PutMapping("/update")
    public Permission updatePermission(@RequestBody Permission permission) {
        return permissionService.add(permission);
    }

    @DeleteMapping("/delete/{id}")
    public void deletePermission(@PathVariable int id) {
        permissionService.deleteById(id);
    }
}
