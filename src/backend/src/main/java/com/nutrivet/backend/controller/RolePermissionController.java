package com.nutrivet.backend.controller;

import com.nutrivet.backend.domain.RolePermission;
import com.nutrivet.backend.dto.UpdatePermissionsRequest;
import com.nutrivet.backend.repository.RolePermissionRepository;
import com.nutrivet.backend.service.RolePermissionService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/role-permission")
@CrossOrigin(origins = "*")
public class RolePermissionController {

    @Autowired 
    private RolePermissionRepository rolePermissionRepository;

    @Autowired 
    private RolePermissionService rolePermissionService;

    @GetMapping("/role/{roleId}")
    @PreAuthorize("hasAuthority('USER_CREATE')")
    public List<Integer> getPermissionsByRole(@PathVariable int roleId) {
        return rolePermissionRepository.findByIdRole(roleId).stream()
                .map(RolePermission::getIdPermission)
                .collect(Collectors.toList());
    }


    @PostMapping("/update/{roleId}")
    @PreAuthorize("hasAuthority('USER_CREATE')")
    public ResponseEntity<?> updatePermissions(@PathVariable int roleId, @RequestBody UpdatePermissionsRequest request) {
        try {
            rolePermissionService.updateRolePermissions(roleId, request.getPermissionIds());
            return ResponseEntity.ok("Permisos actualizados correctamente");
        } catch (RuntimeException e) {
            
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}