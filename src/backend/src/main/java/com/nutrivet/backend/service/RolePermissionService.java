package com.nutrivet.backend.service;

import com.nutrivet.backend.domain.RolePermission;
import com.nutrivet.backend.repository.RolePermissionRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RolePermissionService {

    @Autowired 
    private RolePermissionRepository rolePermissionRepository;

    @Transactional
    public void updateRolePermissions(int roleId, List<Integer> permissionIds) {
        List<RolePermission> currentPermissions = rolePermissionRepository.findByIdRole(roleId);

        if (roleId == 1) {
            
            List<Integer> currentIds = currentPermissions.stream()
                    .map(RolePermission::getIdPermission)
                    .toList();

            
            for (Integer currentId : currentIds) {
                if (permissionIds == null || !permissionIds.contains(currentId)) {
                    throw new RuntimeException("No puedes quitarle permisos existentes al Administrador. Solo puedes añadir nuevos.");
                }
            }
        }

        
        rolePermissionRepository.deleteAll(currentPermissions);

        if (permissionIds != null && !permissionIds.isEmpty()) {
            for (Integer permissionId : permissionIds) {
                RolePermission newRp = new RolePermission();
                newRp.setIdRole(roleId);
                newRp.setIdPermission(permissionId);
                rolePermissionRepository.save(newRp);
            }
        }
    }
}