package com.example.MyDentalAPI.ConsultorioDentistaAPI.controller;

import com.example.MyDentalAPI.ConsultorioDentistaAPI.dto.request.CreateUserRequest;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.dto.request.LoginRequest;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.services.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticação", description = "Login e registro de usuários")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Login — retorna JWT access token e refresh token")
    public ResponseEntity<Map<String, String>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    @Operation(summary = "Cria novo usuário (apenas ADMIN)")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(201).body(authService.register(request));
    }
}