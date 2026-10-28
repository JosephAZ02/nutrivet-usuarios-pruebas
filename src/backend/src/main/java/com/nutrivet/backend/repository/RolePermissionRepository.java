package com.nutrivet.backend.repository;

import com.nutrivet.backend.domain.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;


public interface RolePermissionRepository extends JpaRepository<RolePermission, Integer> {

    List<RolePermission> findByIdRole(int idRole);
}
