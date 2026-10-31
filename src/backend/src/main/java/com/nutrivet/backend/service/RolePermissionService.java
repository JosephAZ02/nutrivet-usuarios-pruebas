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