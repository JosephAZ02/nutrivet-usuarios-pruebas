package com.nutrivet.backend.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.nutrivet.backend.domain.User;
import com.nutrivet.backend.domain.RegisterRequest;
import com.nutrivet.backend.service.UserService;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('USER_CREATE')")
    public List<User> getAllUsers() {
        return userService.getAll();
    }

    @GetMapping("/get/{id}")
    public Optional<User> getUserById(@PathVariable int id) {
        return userService.getById(id);
    }

    @PostMapping("/add")
    @PreAuthorize("hasAuthority('USER_CREATE')")
    public ResponseEntity<?> addUser(@RequestBody RegisterRequest request) {
        try {
            User user = new User();
            user.setUsername(request.getUsername());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setName(request.getName());
            user.setIdRole(request.getRoleId());

            userService.add(user);
            return ResponseEntity.ok("Usuario creado exitosamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al crear usuario: " + e.getMessage());
        }
    }

    @PutMapping("/update")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    public User updateUser(@RequestBody User user) {
        return userService.add(user);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAuthority('USER_DELETE')")
    public ResponseEntity<?> deleteUser(@PathVariable int id) {

        try {
            if (id == 1) {
                return ResponseEntity.badRequest().body("Error: no puede eliminar el usuario principal");
                
            }
            userService.deleteById(id);

            return ResponseEntity.ok("Usuario eliminado exitosamente");

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al eliminar usuario: " + e.getMessage());
        }

    }
}
    