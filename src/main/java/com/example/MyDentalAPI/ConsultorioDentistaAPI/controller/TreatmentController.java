package com.example.MyDentalAPI.ConsultorioDentistaAPI.controller;

import com.example.MyDentalAPI.ConsultorioDentistaAPI.entities.Treatment;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.exception.GlobalExceptionHandler.*;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.repositories.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/treatments")
@RequiredArgsConstructor
@Tag(name = "Tratamentos / Procedimentos")
@SecurityRequirement(name = "bearerAuth")
public class TreatmentController {

    private final TreatmentRepository treatmentRepository;
    private final SpecialtyRepository specialtyRepository;

    @GetMapping
    @Operation(summary = "Lista todos os procedimentos ativos")
    public ResponseEntity<List<Treatment>> findAll() {
        return ResponseEntity.ok(treatmentRepository.findAllByActiveTrue());
    }

    @GetMapping("/specialty/{specialtyId}")
    @Operation(summary = "Lista procedimentos por especialidade")
    public ResponseEntity<List<Treatment>> findBySpecialty(@PathVariable Long specialtyId) {
        return ResponseEntity.ok(treatmentRepository.findAllBySpecialtyIdAndActiveTrue(specialtyId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Treatment> findById(@PathVariable Long id) {
        return ResponseEntity.ok(treatmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tratamento não encontrado: " + id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cadastra procedimento (ADMIN)")
    public ResponseEntity<Treatment> create(@RequestBody Treatment treatment) {
        return ResponseEntity.status(201).body(treatmentRepository.save(treatment));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Treatment> update(@PathVariable Long id, @RequestBody Treatment req) {
        Treatment t = treatmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tratamento não encontrado: " + id));
        t.setName(req.getName());
        t.setDescription(req.getDescription());
        t.setDefaultPrice(req.getDefaultPrice());
        t.setDurationMinutes(req.getDurationMinutes());
        if (req.getSpecialty() != null)
            t.setSpecialty(specialtyRepository.findById(req.getSpecialty().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Especialidade não encontrada")));
        return ResponseEntity.ok(treatmentRepository.save(t));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        Treatment t = treatmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tratamento não encontrado: " + id));
        t.setActive(false);
        treatmentRepository.save(t);
        return ResponseEntity.noContent().build();
    }
}
