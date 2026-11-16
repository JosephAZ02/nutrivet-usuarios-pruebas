
package com.nutrivet.backend.service;

import com.nutrivet.backend.domain.User;
import com.nutrivet.backend.repository.UserRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    // MÉTODO AUXILIAR PARA CREAR USUARIOS
    private User createUser(int id, int roleId) {
        User user = new User();
        user.setId(id);
        user.setIdRole(roleId);
        user.setUsername("testUser");
        return user;
    }

    // ==========================================
    // PRUEBAS DE CONSULTA
    // ==========================================

    @Test
    void getAll_ReturnsListOfUsers() {
        // Arrange
        User user1 = createUser(1, 1);
        User user2 = createUser(2, 2);

        when(userRepository.findAll())
                .thenReturn(List.of(user1, user2));

        // Act
        var result = userService.getAll();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(1, result.get(0).getId());
        assertEquals(2, result.get(1).getId());

        verify(userRepository, times(1)).findAll();
    }

    @Test
    void getAll_ReturnsEmptyListWhenNoUsersExist() {
        // Arrange
        when(userRepository.findAll())
                .thenReturn(List.of());

        // Act
        var result = userService.getAll();

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(userRepository, times(1)).findAll();
    }

    @Test
    void getById_ReturnsUserIfExists() {
        // Arrange
        User user = createUser(1, 1);

        when(userRepository.findById(1))
                .thenReturn(Optional.of(user));

        // Act
        var result = userService.getById(1);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(1, result.get().getId());
        assertEquals("testUser", result.get().getUsername());

        verify(userRepository, times(1)).findById(1);
    }

    @Test
    void getById_ReturnsEmptyIfNotExists() {
        // Arrange
        when(userRepository.findById(99))
                .thenReturn(Optional.empty());

        // Act
        var result = userService.getById(99);

        // Assert
        assertFalse(result.isPresent());

        verify(userRepository, times(1)).findById(99);
    }

    // ==========================================
    // PRUEBAS DE REGISTRO
    // ==========================================

    @Test
    void addUser_SavesAndReturnsUser() {
        // Arrange
        User newUser = createUser(3, 2);

        when(userRepository.save(newUser))
                .thenReturn(newUser);

        // Act
        User savedUser = userService.add(newUser);

        // Assert
        assertNotNull(savedUser);
        assertEquals(3, savedUser.getId());
        assertEquals("testUser", savedUser.getUsername());

        verify(userRepository, times(1)).save(newUser);
    }

    // ==========================================
    // PRUEBAS DE ACTUALIZACIÓN
    // ==========================================

    @Test
    void updateUser_SavesAndReturnsUser() {
        
        // Arrange
        User existingUser = createUser(1, 1);
        existingUser.setUsername("nuevoUsername");

        when(userRepository.save(existingUser))
                .thenReturn(existingUser);

        // Act
        User updatedUser = userService.updateUser(existingUser);

        // Assert
        assertNotNull(updatedUser);
        assertEquals("nuevoUsername", updatedUser.getUsername());

        verify(userRepository, times(1)).save(existingUser);
    }

    // ==========================================
    // PRUEBAS DE ELIMINACIÓN
    // ==========================================

    @Test
    void deleteById_CallsRepositoryDelete() {
        // Arrange
        int userId = 5;

        // Act
        userService.deleteById(userId);

        // Assert
        verify(userRepository, times(1)).deleteById(userId);
    }

    @Test
    void deleteLastAdmin_ThrowsException() {
        // Arrange
        User admin = createUser(1, 1);

        when(userRepository.findById(1))
                .thenReturn(Optional.of(admin));

        when(userRepository.countByIdRole(1))
                .thenReturn(1L);

        // Act
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> userService.checkIfLastAdminOnDelete(1));

        // Assert
        assertEquals(
                "No se puede eliminar al último Administrador del sistema.",
                exception.getMessage());

        verify(userRepository, never()).deleteById(anyInt());
    }

    @Test
    void deleteNormalUser_DoesNotThrowException() {
        // Arrange
        User vendedor = createUser(2, 2);

        when(userRepository.findById(2))
                .thenReturn(Optional.of(vendedor));

        // Act & Assert
        assertDoesNotThrow(
                () -> userService.checkIfLastAdminOnDelete(2));

        verify(userRepository, never()).countByIdRole(anyInt());
    }

    @Test
    void deleteAdmin_WhenThereAreTwoAdmins_DoesNotThrowException() {
        // Arrange
        User admin = createUser(1, 1);

        when(userRepository.findById(1))
                .thenReturn(Optional.of(admin));

        when(userRepository.countByIdRole(1))
                .thenReturn(2L);

        // Act & Assert
        assertDoesNotThrow(
                () -> userService.checkIfLastAdminOnDelete(1));

        verify(userRepository, times(1)).countByIdRole(1);
    }

    // ==========================================
    // PRUEBAS DE ACTUALIZACIÓN DE ROLES
    // ==========================================

    @Test
    void degradeLastAdmin_ThrowsException() {
        // Arrange
        User admin = createUser(1, 1);

        when(userRepository.findById(1))
                .thenReturn(Optional.of(admin));

        when(userRepository.countByIdRole(1))
                .thenReturn(1L);

        // Act
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> userService.checkIfLastAdmin(1, 2));

        // Assert
        assertEquals(
                "No se puede degradar al último Administrador del sistema.",
                exception.getMessage());
    }

    @Test
    void degradeAdmin_WhenThereAreTwoAdmins_DoesNotThrowException() {
        // Arrange
        User admin = createUser(1, 1);

        when(userRepository.findById(1))
                .thenReturn(Optional.of(admin));

        when(userRepository.countByIdRole(1))
                .thenReturn(2L);

        // Act & Assert
        assertDoesNotThrow(
                () -> userService.checkIfLastAdmin(1, 2));

        verify(userRepository, times(1)).countByIdRole(1);
    }

    @Test
    void promoteNormalUserToAdmin_DoesNotThrowException() {
        // Arrange
        User vendedor = createUser(2, 2);

        when(userRepository.findById(2))
                .thenReturn(Optional.of(vendedor));

        // Act & Assert
        assertDoesNotThrow(
                () -> userService.checkIfLastAdmin(2, 1));

        verify(userRepository, never()).countByIdRole(anyInt());
    }

}
