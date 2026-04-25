package com.example.MyDentalAPI.ConsultorioDentistaAPI.controller;

import com.example.MyDentalAPI.ConsultorioDentistaAPI.dto.request.PatientRequest;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.entities.Patient;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.services.PatientService;
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
@RequestMapping("/api/patients")
@RequiredArgsConstructor
@Tag(name = "Pacientes")
@SecurityRequirement(name = "bearerAuth")
public class PatientController {

    private final PatientService patientService;

    @GetMapping
    @Operation(summary = "Lista pacientes com paginação e busca por nome, CPF ou telefone")
    public ResponseEntity<Page<Patient>> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sort) {
        return ResponseEntity.ok(patientService.findAll(search, PageRequest.of(page, size, Sort.by(sort))));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca paciente por ID")
    public ResponseEntity<Patient> findById(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.findById(id));
    }

    @GetMapping("/cpf/{cpf}")
    @Operation(summary = "Busca paciente por CPF")
    public ResponseEntity<Patient> findByCpf(@PathVariable String cpf) {
        return ResponseEntity.ok(patientService.findByCpf(cpf));
    }

    @PostMapping
    @Operation(summary = "Cadastra novo paciente")
    public ResponseEntity<Patient> create(@Valid @RequestBody PatientRequest request) {
        Patient created = patientService.create(request);
        return ResponseEntity.created(URI.create("/api/patients/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza dados do paciente")
    public ResponseEntity<Patient> update(@PathVariable Long id, @Valid @RequestBody PatientRequest request) {
        return ResponseEntity.ok(patientService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Desativa paciente (soft delete)")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        patientService.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}