package com.example.MyDentalAPI.ConsultorioDentistaAPI.dto.request;

import com.example.MyDentalAPI.ConsultorioDentistaAPI.enums.PaymentMethod;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record PaymentRequest(
        @NotNull Long patientId,
        Long appointmentId,
        Long medicalRecordId,
        @NotNull @DecimalMin("0.01") BigDecimal amount,
        @DecimalMin("0.0") BigDecimal discount,
        @NotNull PaymentMethod paymentMethod,
        String notes
) {}
