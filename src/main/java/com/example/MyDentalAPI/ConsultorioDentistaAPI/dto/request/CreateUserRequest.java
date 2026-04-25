package com.example.MyDentalAPI.ConsultorioDentistaAPI.dto.request;

import com.example.MyDentalAPI.ConsultorioDentistaAPI.enums.UserRole;
import jakarta.validation.constraints.*;

public record CreateUserRequest(
        @NotBlank(message = "Nome é obrigatório") String name,
        @NotBlank @Email(message = "Email inválido") String email,
        @NotBlank @Size(min = 8, message = "Senha deve ter no mínimo 8 caracteres") String password,
        @NotNull UserRole role
) {}