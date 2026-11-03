package com.nutrivet.backend.controller;

import java.util.List;
import java.util.Optional;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.nutrivet.backend.domain.User;
import com.nutrivet.backend.dto.RegisterUserRequest;
import com.nutrivet.backend.dto.UpdateUserRequest;
import com.nutrivet.backend.service.UserService;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('USER_GET_ALL')")
    public List<User> getAllUsers() {
        return userService.getAll();
    }

    @GetMapping("/get/{id}")
    @PreAuthorize("hasAuthority('USER_GET_BY_ID')")
    public Optional<User> getUserById(@PathVariable int id) {
        return userService.getById(id);
    }

    @PostMapping("/add")
    @PreAuthorize("hasAuthority('USER_CREATE')")
    public ResponseEntity<?> addUser(@RequestBody RegisterUserRequest request) {
        try {
            User user = new User();
            user.setUsername(request.getUsername());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setName(request.getName());
            user.setEmail(request.getEmail());
            user.setIdRole(request.getRoleId());

            userService.add(user);
            return ResponseEntity.ok("Usuario creado exitosamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al crear usuario: " + e.getMessage());
        }
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    public ResponseEntity<?> updateUser(@PathVariable int id, @RequestBody UpdateUserRequest request) {
        try {

            User user = userService.getById(id)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            userService.checkIfLastAdmin(id, request.getRoleId());

            user.setName(request.getName());
            user.setUsername(request.getUsername());
            user.setEmail(request.getEmail());
            user.setIdRole(request.getRoleId());

            if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
                user.setPassword(passwordEncoder.encode(request.getPassword()));
            }

            userService.updateUser(user);

            return ResponseEntity.ok("Usuario actualizado correctamente");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAuthority('USER_DELETE')")
    public ResponseEntity<?> deleteUser(@PathVariable int id) {
        try {

            userService.checkIfLastAdminOnDelete(id);

            userService.deleteById(id);
            return ResponseEntity.ok("Usuario eliminado correctamente");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
