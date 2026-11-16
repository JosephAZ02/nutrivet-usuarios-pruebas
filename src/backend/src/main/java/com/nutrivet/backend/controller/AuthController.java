package com.nutrivet.backend.controller;

import com.nutrivet.backend.service.PasswordResetService;
import com.nutrivet.backend.domain.LoginRequest;
import com.nutrivet.backend.service.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;

import org.springframework.web.bind.annotation.*;

import com.nutrivet.backend.dto.ForgotPasswordRequest;
import com.nutrivet.backend.dto.ResetPasswordRequest;
import com.nutrivet.backend.domain.User;
import com.nutrivet.backend.repository.UserRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/auth")
public class AuthController {


   

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;

    private final UserRepository userRepository;
    
    private final PasswordResetService passwordResetService;


    public AuthController(AuthenticationManager authenticationManager, UserDetailsService userDetailsService,
            JwtService jwtService , PasswordResetService passwordService, UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
       
        this.jwtService = jwtService;
        
        this.passwordResetService = passwordService;
        this.userRepository = userRepository;
    }

   @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Error: Credenciales incorrectas");
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        final String jwt = jwtService.generateToken(userDetails);

        List<String> permissions = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        
        User user = userRepository.findByUsername(request.getUsername()).orElseThrow();

        Map<String, Object> response = new HashMap<>();
        response.put("token", jwt);
        response.put("permissions", permissions);
        response.put("name", user.getName()); 
        response.put("username", user.getUsername()); 
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            passwordResetService.createTokenForEmail(request.getEmail());
            
            return ResponseEntity.ok("Si el correo está registrado, recibirás un código.");
        } catch (Exception e) {
            
            return ResponseEntity.ok("Si el correo está registrado, recibirás un código.");
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok("Contraseña actualizada correctamente.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
