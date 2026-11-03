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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RolePermissionServiceTest {

    @Mock
    private RolePermissionRepository rolePermissionRepository;

    @InjectMocks
    private RolePermissionService rolePermissionService;

    // --- HELPER PARA CREAR PERMISOS FALSOS ---
    private RolePermission createRolePermission(int idPermission) {
        RolePermission rp = new RolePermission();
        rp.setIdPermission(idPermission);
        return rp;
    }

    @Test
    void updateAdminPermissions_TryingToRemove_ThrowsException() {
        // 1. PREPARACIÓN: El Admin (rol 1) actualmente tiene los permisos 1 y 2
        RolePermission permiso1 = createRolePermission(1);
        RolePermission permiso2 = createRolePermission(2);
        when(rolePermissionRepository.findByIdRole(1)).thenReturn(Arrays.asList(permiso1, permiso2));

        // Intentamos actualizar al admin pasándole SOLO el permiso 1 (queremos quitarle el 2)
        List<Integer> nuevosPermisos = List.of(1);

        // 2. EJECUCIÓN Y VERIFICACIÓN
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            rolePermissionService.updateRolePermissions(1, nuevosPermisos);
        });

        // 3. VERIFICACIÓN: El mensaje correcto y NO se borró nada en la BD
        assertEquals("Operación denegada: No puedes quitarle permisos existentes al Administrador. Solo puedes añadir nuevos.", 
                     exception.getMessage());
        verify(rolePermissionRepository, never()).deleteAll(anyList());
    }

    @Test
    void updateAdminPermissions_AddingNew_Success() {
        // 1. PREPARACIÓN: El Admin (rol 1) actualmente tiene el permiso 1
        RolePermission permiso1 = createRolePermission(1);
        when(rolePermissionRepository.findByIdRole(1)).thenReturn(List.of(permiso1));

        // Le pasamos el permiso 1 (que ya tiene) y el 2 (nuevo)
        List<Integer> nuevosPermisos = List.of(1, 2);

        // 2. EJECUCIÓN: No debería lanzar excepción
        assertDoesNotThrow(() -> {
            rolePermissionService.updateRolePermissions(1, nuevosPermisos);
        });

        // 3. VERIFICACIÓN: Sí se borraron los viejos para insertar la nueva lista
        verify(rolePermissionRepository, times(1)).deleteAll(anyList());
        verify(rolePermissionRepository, times(2)).save(any(RolePermission.class)); // Guardó 2 permisos
    }

    @Test
    void updateNormalRolePermissions_TryingToRemove_Success() {
        // 1. PREPARACIÓN: El Vendedor (rol 2) tiene los permisos 1 y 2
        RolePermission permiso1 = createRolePermission(1);
        RolePermission permiso2 = createRolePermission(2);
        when(rolePermissionRepository.findByIdRole(2)).thenReturn(Arrays.asList(permiso1, permiso2));

        // Le pasamos solo el permiso 2 (le estamos quitando el 1)
        List<Integer> nuevosPermisos = List.of(2);

        // 2. EJECUCIÓN: No debería lanzar excepción porque NO es el admin
        assertDoesNotThrow(() -> {
            rolePermissionService.updateRolePermissions(2, nuevosPermisos);
        });

        // 3. VERIFICACIÓN: Borró los viejos y guardó solo el nuevo
        verify(rolePermissionRepository, times(1)).deleteAll(anyList());
        verify(rolePermissionRepository, times(1)).save(any(RolePermission.class));
    }

    @Test
    void updateRolePermissions_WithNullList_DeletesAll() {
        // 1. PREPARACIÓN: El Vendedor (rol 2) tiene permisos
        RolePermission permiso1 = createRolePermission(1);
        when(rolePermissionRepository.findByIdRole(2)).thenReturn(List.of(permiso1));

        // 2. EJECUCIÓN: Le pasamos null (quitar todos los permisos)
        assertDoesNotThrow(() -> {
            rolePermissionService.updateRolePermissions(2, null);
        });

        // 3. VERIFICACIÓN: Borró todo, pero no guardó nada nuevo
        verify(rolePermissionRepository, times(1)).deleteAll(anyList());
        verify(rolePermissionRepository, never()).save(any(RolePermission.class));
    }
}