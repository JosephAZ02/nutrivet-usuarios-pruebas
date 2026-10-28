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
    public List<Role> getAllRoles() {
        return roleService.getAll();
    }

    @GetMapping("/get/{id}")
    public Optional<Role> getRoleById(@PathVariable int id) {
        return roleService.getById(id);
    }

    @PostMapping("/add")
    public Role addRole(@RequestBody Role role) {
        return roleService.add(role);
    }

    @PutMapping("/update")
    public Role updateRole(@RequestBody Role role) {
        return roleService.add(role);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteRole(@PathVariable int id) {
        roleService.deleteById(id);
    }
}
