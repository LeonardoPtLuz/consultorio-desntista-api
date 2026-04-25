package com.example.MyDentalAPI.ConsultorioDentistaAPI.dto.request;

import com.example.MyDentalAPI.ConsultorioDentistaAPI.enums.Gender;
import jakarta.validation.constraints.*;
import org.hibernate.validator.constraints.br.CPF;
import java.time.LocalDate;

public record PatientRequest(
        @NotBlank(message = "Nome é obrigatório") String name,
        @NotBlank @CPF(message = "CPF inválido") String cpf,
        @NotNull(message = "Data de nascimento é obrigatória") LocalDate birthDate,
        @NotNull(message = "Gênero é obrigatório") Gender gender,
        @NotBlank(message = "Telefone é obrigatório") String phone,
        @Email(message = "Email inválido") String email,
        String addressStreet,
        String addressNumber,
        String addressDistrict,
        String addressCity,
        String addressState,
        String addressZip,
        String healthPlan,
        String healthPlanNumber,
        String allergies,
        String observations
) {}
