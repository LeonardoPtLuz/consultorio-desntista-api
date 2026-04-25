package com.example.MyDentalAPI.ConsultorioDentistaAPI.controller;

import com.example.MyDentalAPI.ConsultorioDentistaAPI.dto.request.AppointmentRequest;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.entities.Appointment;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.enums.AppointmentStatus;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.services.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@Tag(name = "Agendamentos")
@SecurityRequirement(name = "bearerAuth")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @GetMapping
    @Operation(summary = "Lista agendamentos com paginação")
    public ResponseEntity<Page<Appointment>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(appointmentService.findAll(PageRequest.of(page, size, Sort.by("scheduledAt"))));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca agendamento por ID")
    public ResponseEntity<Appointment> findById(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.findById(id));
    }

    @GetMapping("/patient/{patientId}")
    @Operation(summary = "Lista agendamentos de um paciente")
    public ResponseEntity<Page<Appointment>> findByPatient(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(appointmentService.findByPatient(patientId, PageRequest.of(page, size)));
    }

    @GetMapping("/dentist/{dentistId}")
    @Operation(summary = "Lista agendamentos de um dentista")
    public ResponseEntity<Page<Appointment>> findByDentist(
            @PathVariable Long dentistId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(appointmentService.findByDentist(dentistId, PageRequest.of(page, size)));
    }

    @GetMapping("/dentist/{dentistId}/schedule")
    @Operation(summary = "Agenda de um dentista por período")
    public ResponseEntity<List<Appointment>> dentistSchedule(
            @PathVariable Long dentistId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(appointmentService.findByDentistAndDate(dentistId, start, end));
    }

    @GetMapping("/range")
    @Operation(summary = "Agenda geral por período")
    public ResponseEntity<List<Appointment>> findByRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(appointmentService.findByDateRange(start, end));
    }

    @PostMapping
    @Operation(summary = "Cria novo agendamento (valida conflito de horário)")
    public ResponseEntity<Appointment> create(@Valid @RequestBody AppointmentRequest request) {
        Appointment created = appointmentService.create(request);
        return ResponseEntity.created(URI.create("/api/appointments/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza agendamento")
    public ResponseEntity<Appointment> update(@PathVariable Long id, @Valid @RequestBody AppointmentRequest request) {
        return ResponseEntity.ok(appointmentService.update(id, request));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Atualiza status do agendamento")
    public ResponseEntity<Appointment> updateStatus(
            @PathVariable Long id,
            @RequestParam AppointmentStatus status) {
        return ResponseEntity.ok(appointmentService.updateStatus(id, status));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancela um agendamento")
    public ResponseEntity<Void> cancel(
            @PathVariable Long id,
            @RequestParam(defaultValue = "Cancelado pelo sistema") String reason) {
        appointmentService.cancel(id, reason);
        return ResponseEntity.noContent().build();
    }
}