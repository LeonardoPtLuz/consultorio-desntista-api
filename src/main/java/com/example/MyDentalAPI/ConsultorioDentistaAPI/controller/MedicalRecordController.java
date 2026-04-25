package com.example.MyDentalAPI.ConsultorioDentistaAPI.controller;

import com.example.MyDentalAPI.ConsultorioDentistaAPI.dto.request.MedicalRecordRequest;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.entities.MedicalRecord;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.services.MedicalRecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/medical-records")
@RequiredArgsConstructor
@Tag(name = "Prontuários")
@SecurityRequirement(name = "bearerAuth")
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    @GetMapping("/patient/{patientId}")
    @Operation(summary = "Histórico clínico completo do paciente")
    public ResponseEntity<Page<MedicalRecord>> findByPatient(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(medicalRecordService.findByPatient(patientId, PageRequest.of(page, size)));
    }

    @GetMapping("/dentist/{dentistId}")
    @Operation(summary = "Prontuários registrados por um dentista")
    public ResponseEntity<Page<MedicalRecord>> findByDentist(
            @PathVariable Long dentistId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(medicalRecordService.findByDentist(dentistId, PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca prontuário por ID")
    public ResponseEntity<MedicalRecord> findById(@PathVariable Long id) {
        return ResponseEntity.ok(medicalRecordService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Registra novo prontuário / evolução clínica")
    public ResponseEntity<MedicalRecord> create(@Valid @RequestBody MedicalRecordRequest request) {
        MedicalRecord created = medicalRecordService.create(request);
        return ResponseEntity.created(URI.create("/api/medical-records/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza prontuário")
    public ResponseEntity<MedicalRecord> update(@PathVariable Long id, @Valid @RequestBody MedicalRecordRequest request) {
        return ResponseEntity.ok(medicalRecordService.update(id, request));
    }
}
