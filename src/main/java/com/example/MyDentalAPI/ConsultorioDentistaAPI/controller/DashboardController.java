package com.example.MyDentalAPI.ConsultorioDentistaAPI.controller;

import com.example.MyDentalAPI.ConsultorioDentistaAPI.enums.AppointmentStatus;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.repositories.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.*;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard / Relatórios")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ADMIN','RECEPCIONISTA')")
public class DashboardController {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository     patientRepository;
    private final DentistRepository     dentistRepository;
    private final PaymentRepository     paymentRepository;

    @GetMapping("/summary")
    @Operation(summary = "Resumo geral do consultório")
    public ResponseEntity<Map<String, Object>> summary() {
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime todayEnd   = todayStart.plusDays(1);
        LocalDateTime monthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();

        return ResponseEntity.ok(Map.of(
                "totalPatients",           patientRepository.count(),
                "activeDentists",          dentistRepository.findAllByActiveTrue().size(),
                "appointmentsToday",       appointmentRepository.findAllByScheduledAtBetween(todayStart, todayEnd).size(),
                "pendingAppointments",     appointmentRepository.countByStatus(AppointmentStatus.AGENDADO),
                "monthlyRevenue",          paymentRepository.sumPaidBetween(monthStart, todayEnd),
                "cancelledThisMonth",      appointmentRepository.countByStatus(AppointmentStatus.CANCELADO),
                "generatedAt",             LocalDateTime.now()
        ));
    }

    @GetMapping("/appointments/today")
    @Operation(summary = "Agenda de hoje")
    public ResponseEntity<?> todayAppointments() {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end   = start.plusDays(1);
        return ResponseEntity.ok(appointmentRepository.findAllByScheduledAtBetween(start, end));
    }
}