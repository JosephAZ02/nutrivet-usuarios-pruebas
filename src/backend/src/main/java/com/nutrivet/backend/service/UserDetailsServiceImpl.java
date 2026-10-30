package com.nutrivet.backend.service;

import com.nutrivet.backend.domain.Permission;
import com.nutrivet.backend.domain.RolePermission;
import com.nutrivet.backend.domain.User;
import com.nutrivet.backend.repository.PermissionRepository;
import com.nutrivet.backend.repository.RolePermissionRepository;
import com.nutrivet.backend.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    
    private final UserRepository userRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final PermissionRepository permissionRepository;

    public UserDetailsServiceImpl(UserRepository userRepository, RolePermissionRepository rolePermissionRepository, PermissionRepository permissionRepository) {
        this.userRepository = userRepository;
        this.rolePermissionRepository = rolePermissionRepository;
        this.permissionRepository = permissionRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));

        
        List<RolePermission> rolePermissions = rolePermissionRepository.findByIdRole(user.getIdRole());

        
        List<Integer> permissionIds = new ArrayList<>();
        for (RolePermission rp : rolePermissions) {
            permissionIds.add(rp.getIdPermission());
        }

        
        List<Permission> permissions = permissionRepository.findAllById(permissionIds);

      
        List<GrantedAuthority> authorities = new ArrayList<>();
        for (Permission permission : permissions) {
            
            authorities.add(new SimpleGrantedAuthority(permission.getName()));
        }

        
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                authorities);
    }
}