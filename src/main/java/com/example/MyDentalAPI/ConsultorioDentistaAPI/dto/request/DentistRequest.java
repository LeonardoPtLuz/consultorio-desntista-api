package com.example.MyDentalAPI.ConsultorioDentistaAPI.dto.request;

import jakarta.validation.constraints.*;

public record DentistRequest(
        @NotBlank(message = "Nome é obrigatório") String name,
        @NotBlank(message = "CRO é obrigatório") String cro,
        @NotBlank(message = "Estado do CRO é obrigatório") @Size(min = 2, max = 2) String croState,
        @NotNull(message = "Especialidade é obrigatória") Long specialtyId,
        String phone,
        @NotBlank @Email(message = "Email inválido") String email,
        Long userId
) {}
