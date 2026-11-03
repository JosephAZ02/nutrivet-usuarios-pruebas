package com.nutrivet.backend.service;


import com.nutrivet.backend.domain.User;
import com.nutrivet.backend.repository.UserRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    // --- HELPER PARA CREAR USUARIOS FALSOS ---
    private User createUser(int id, int roleId) {
        User user = new User();
        user.setId(id);
        user.setIdRole(roleId);
        user.setUsername("testUser");
        return user;
    }

    // --- PRUEBAS PARA BORRAR USUARIO ---

    @Test
    void deleteLastAdmin_ThrowsException() {
        // 1. PREPARACIÓN: El usuario es Admin (rol 1) y solo hay 1 admin en el sistema
        User admin = createUser(1, 1);
        when(userRepository.findById(1)).thenReturn(Optional.of(admin));
        when(userRepository.countByIdRole(1)).thenReturn(1L);

        // 2. EJECUCIÓN Y VERIFICACIÓN: Debe lanzar una excepción
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.checkIfLastAdminOnDelete(1);
        });

        // 3. VERIFICACIÓN: El mensaje debe ser el correcto y NO debe borrar en la BD
        assertEquals("ACCIÓN DENEGADA: No se puede eliminar al último Administrador del sistema.", exception.getMessage());
        verify(userRepository, never()).deleteById(anyInt());
    }

    @Test
    void deleteNormalUser_DoesNotThrowException() {
        // 1. PREPARACIÓN: El usuario tiene rol 2 (Vendedor)
        User vendedor = createUser(2, 2);
        when(userRepository.findById(2)).thenReturn(Optional.of(vendedor));

        // 2. EJECUCIÓN: No debería lanzar excepción
        assertDoesNotThrow(() -> {
            userService.checkIfLastAdminOnDelete(2);
        });

        // 3. VERIFICACIÓN: No se consultó el conteo de admins (porque no es admin)
        verify(userRepository, never()).countByIdRole(anyInt());
    }

    @Test
    void deleteAdmin_WhenThereAreTwoAdmins_Success() {
        // 1. PREPARACIÓN: Es admin, pero hay 2 en el sistema
        User admin = createUser(1, 1);
        when(userRepository.findById(1)).thenReturn(Optional.of(admin));
        when(userRepository.countByIdRole(1)).thenReturn(2L);

        // 2. EJECUCIÓN: No debería lanzar excepción
        assertDoesNotThrow(() -> {
            userService.checkIfLastAdminOnDelete(1);
        });
    }

    // --- PRUEBAS PARA ACTUALIZAR ROL (DEGRADAR) ---

    @Test
    void degradeLastAdmin_ThrowsException() {
        // 1. PREPARACIÓN: Es admin (rol 1), lo quieren pasar a rol 2. Solo hay 1 admin.
        User admin = createUser(1, 1);
        when(userRepository.findById(1)).thenReturn(Optional.of(admin));
        when(userRepository.countByIdRole(1)).thenReturn(1L);

        // 2. EJECUCIÓN Y VERIFICACIÓN
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.checkIfLastAdmin(1, 2); // ID 1, nuevo rol 2
        });

        assertEquals("ACCIÓN DENEGADA: No se puede degradar al último Administrador del sistema.", exception.getMessage());
    }

    @Test
    void promoteNormalUserToAdmin_Success() {
        // 1. PREPARACIÓN: Es vendedor (rol 2), lo quieren hacer admin (rol 1).
        User vendedor = createUser(2, 2);
        when(userRepository.findById(2)).thenReturn(Optional.of(vendedor));

        // 2. EJECUCIÓN: No debería lanzar excepción
        assertDoesNotThrow(() -> {
            userService.checkIfLastAdmin(2, 1); 
        });

        // 3. VERIFICACIÓN: No se consultó el count porque no era admin antes
        verify(userRepository, never()).countByIdRole(anyInt());
    }
}