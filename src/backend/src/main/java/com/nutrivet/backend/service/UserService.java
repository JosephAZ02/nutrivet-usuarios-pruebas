
package com.nutrivet.backend.service;

import com.nutrivet.backend.domain.User;
import com.nutrivet.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    private static final int ADMIN_ROLE_ID = 1;

    public List<User> getAll() {
        return userRepository.findAll();
    }

    public Optional<User> getById(int id) {
        return userRepository.findById(id);
    }

    public User add(User user) {
        return userRepository.save(user);
    }

    public void checkIfLastAdmin(int userId, int newRoleId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (user.getIdRole() == ADMIN_ROLE_ID && newRoleId != ADMIN_ROLE_ID) {
            long adminCount = userRepository.countByIdRole(ADMIN_ROLE_ID);
            if (adminCount <= 1) {
                throw new RuntimeException(
                        "ACCIÓN DENEGADA: No se puede degradar al último Administrador del sistema.");
            }
        }
    }

    public void checkIfLastAdminOnDelete(int userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (user.getIdRole() == ADMIN_ROLE_ID) {
            long adminCount = userRepository.countByIdRole(ADMIN_ROLE_ID);
            if (adminCount <= 1) {
                throw new RuntimeException(
                        "ACCIÓN DENEGADA: No se puede eliminar al último Administrador del sistema.");
            }
        }
    }

    @Transactional
    public void deleteById(int id) {

        userRepository.deleteById(id);
    }

    @Transactional
    public User updateUser(User user) {
        return userRepository.save(user);
    }
}