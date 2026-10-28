package com.nutrivet.backend.repository;

import com.nutrivet.backend.domain.Role;
import org.springframework.data.jpa.repository.JpaRepository;


public interface RoleRepository extends JpaRepository<Role, Integer> {
}
