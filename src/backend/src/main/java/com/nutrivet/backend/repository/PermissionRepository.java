package com.nutrivet.backend.repository;

import com.nutrivet.backend.domain.Permission;
import org.springframework.data.jpa.repository.JpaRepository;


public interface PermissionRepository extends JpaRepository<Permission, Integer> {
}
