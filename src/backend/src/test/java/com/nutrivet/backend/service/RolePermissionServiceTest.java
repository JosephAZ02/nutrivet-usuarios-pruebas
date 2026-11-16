package com.nutrivet.backend.service;

import com.nutrivet.backend.domain.RolePermission;
import com.nutrivet.backend.repository.RolePermissionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RolePermissionServiceTest {

    @Mock
    private RolePermissionRepository rolePermissionRepository;

    @InjectMocks
    private RolePermissionService rolePermissionService;

    // Helper para simular la respuesta de la base de datos
    private RolePermission mockPermission(int id) {
        RolePermission rp = new RolePermission();
        rp.setIdPermission(id);
        return rp;
    }

    @Test
    void testAdminCannotRemoveExistingPermissions() {
        // 1. Preparación: El Admin (rol 1) tiene los permisos 1 y 2 en la BD
        when(rolePermissionRepository.findByIdRole(1)).thenReturn(Arrays.asList(mockPermission(1), mockPermission(2)));

        // 2. Ejecución: Intentamos actualizar al Admin dejándole SOLO el permiso 1 (queremos quitarle el 2)
        List<Integer> newPermissions = List.of(1);

        // 3. Verificación: Debe lanzar una excepción
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            rolePermissionService.updateRolePermissions(1, newPermissions);
        });

        // Verificamos el mensaje de error (ajusta el texto si tu código dice algo diferente)
        assertTrue(exception.getMessage().contains("No puedes quitarle permisos existentes al Administrador"));

        // VERIFICACIÓN CRÍTICA: La base de datos NO debe haber sido alterada
        verify(rolePermissionRepository, never()).deleteAll(anyList());
        verify(rolePermissionRepository, never()).save(any(RolePermission.class));
    }

    @Test
    void testAdminCanAddNewPermissions() {
        // 1. Preparación: El Admin tiene el permiso 1
        when(rolePermissionRepository.findByIdRole(1)).thenReturn(List.of(mockPermission(1)));

        // 2. Ejecución: Le pasamos el permiso 1 (que ya tiene) y el 2 (nuevo)
        List<Integer> newPermissions = List.of(1, 2);

        // 3. Verificación: No debe lanzar excepción
        assertDoesNotThrow(() -> {
            rolePermissionService.updateRolePermissions(1, newPermissions);
        });

        // Se debieron borrar los viejos y guardar los dos nuevos
        verify(rolePermissionRepository, times(1)).deleteAll(anyList());
        verify(rolePermissionRepository, times(2)).save(any(RolePermission.class));
    }

    @Test
    void testNormalRoleCanRemoveOrModifyPermissions() {
        // 1. Preparación: Un rol normal (ej. Vendedor, rol 2) tiene los permisos 1 y 2
        when(rolePermissionRepository.findByIdRole(2)).thenReturn(Arrays.asList(mockPermission(1), mockPermission(2)));

        // 2. Ejecución: Queremos quitarle el permiso 1 y dejarle solo el 2
        List<Integer> newPermissions = List.of(2);

        // 3. Verificación: Debe permitirlo sin excepciones
        assertDoesNotThrow(() -> {
            rolePermissionService.updateRolePermissions(2, newPermissions);
        });

        // Se borran los viejos y se guarda solo el nuevo
        verify(rolePermissionRepository, times(1)).deleteAll(anyList());
        verify(rolePermissionRepository, times(1)).save(any(RolePermission.class));
    }
}