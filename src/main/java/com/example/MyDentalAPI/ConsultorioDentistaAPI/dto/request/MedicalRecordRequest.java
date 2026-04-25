package com.example.MyDentalAPI.ConsultorioDentistaAPI.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record MedicalRecordRequest(
        @NotNull(message = "Paciente é obrigatório") Long patientId,
        @NotNull(message = "Dentista é obrigatório") Long dentistId,
        Long appointmentId,
        Long treatmentId,
        @NotBlank(message = "Descrição é obrigatória") String description,
        String diagnosis,
        String prescription,
        String nextSteps,
        String toothNumber,
        @DecimalMin(value = "0.0", message = "Valor não pode ser negativo") BigDecimal priceCharged
) {}