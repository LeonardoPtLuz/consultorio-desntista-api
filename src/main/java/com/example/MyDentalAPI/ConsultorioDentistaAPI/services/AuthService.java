package com.example.MyDentalAPI.ConsultorioDentistaAPI.services;

import com.example.MyDentalAPI.ConsultorioDentistaAPI.dto.request.CreateUserRequest;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.dto.request.LoginRequest;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.entities.User;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.exception.GlobalExceptionHandler.*;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.repositories.UserRepository;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authManager;

    public Map<String, String> login(LoginRequest request) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        return Map.of(
                "accessToken",  jwtService.generateToken(user),
                "refreshToken", jwtService.generateRefreshToken(user),
                "role",         user.getRole().name(),
                "name",         user.getName()
        );
    }

    public Map<String, String> register(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.email()))
            throw new ConflictException("Email já cadastrado: " + request.email());
        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(request.role())
                .active(true)
                .build();
        userRepository.save(user);
        return Map.of("message", "Usuário criado com sucesso", "email", user.getEmail());
    }
}
