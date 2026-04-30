package com.example.MyDentalAPI.ConsultorioDentistaAPI.controller;

import com.example.MyDentalAPI.ConsultorioDentistaAPI.dto.request.MedicalRecordRequest;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.entities.MedicalRecord;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.services.MedicalRecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/medical-records")
@RequiredArgsConstructor
@Tag(name = "Prontuários", description = "Gestão de prontuários odontológicos")
@SecurityRequirement(name = "bearerAuth")
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    @GetMapping("/patient/{patientId}")
    @Operation(summary = "Listar prontuários de um paciente", description = "Retorna o histórico clínico completo de um paciente com paginação")
    public ResponseEntity<Page<MedicalRecord>> findByPatient(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {   // Alterado para 15 para consistência com o frontend

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(medicalRecordService.findByPatient(patientId, pageable));
    }

    @GetMapping("/dentist/{dentistId}")
    @Operation(summary = "Listar prontuários registrados por um dentista")
    public ResponseEntity<Page<MedicalRecord>> findByDentist(
            @PathVariable Long dentistId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(medicalRecordService.findByDentist(dentistId, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar prontuário por ID")
    public ResponseEntity<MedicalRecord> findById(@PathVariable Long id) {
        return ResponseEntity.ok(medicalRecordService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Criar novo prontuário")
    public ResponseEntity<MedicalRecord> create(@Valid @RequestBody MedicalRecordRequest request) {
        MedicalRecord created = medicalRecordService.create(request);
        return ResponseEntity
                .created(URI.create("/api/medical-records/" + created.getId()))
                .body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar prontuário existente")
    public ResponseEntity<MedicalRecord> update(
            @PathVariable Long id,
            @Valid @RequestBody MedicalRecordRequest request) {

        MedicalRecord updated = medicalRecordService.update(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir prontuário", description = "Exclui um prontuário permanentemente")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        medicalRecordService.delete(id);
        return ResponseEntity.noContent().build();
    }
}