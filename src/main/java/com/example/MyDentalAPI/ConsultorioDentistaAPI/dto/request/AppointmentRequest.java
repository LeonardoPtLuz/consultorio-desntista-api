package com.example.MyDentalAPI.ConsultorioDentistaAPI.dto.request;

import com.example.MyDentalAPI.ConsultorioDentistaAPI.enums.AppointmentStatus;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public record AppointmentRequest(
        @NotNull(message = "Paciente é obrigatório") Long patientId,
        @NotNull(message = "Dentista é obrigatório") Long dentistId,
        Long treatmentId,
        @NotNull(message = "Data/hora é obrigatória")
        @Future(message = "A consulta deve ser agendada para uma data futura")
        LocalDateTime scheduledAt,
        @Min(value = 15, message = "Duração mínima é 15 minutos") Integer durationMinutes,
        String notes
) {}