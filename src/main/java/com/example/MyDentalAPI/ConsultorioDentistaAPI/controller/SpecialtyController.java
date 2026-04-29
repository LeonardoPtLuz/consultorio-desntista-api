package com.example.MyDentalAPI.ConsultorioDentistaAPI.controller;

import com.example.MyDentalAPI.ConsultorioDentistaAPI.entities.Specialty;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.exception.GlobalExceptionHandler.*;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.repositories.SpecialtyRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/specialties")
@RequiredArgsConstructor
@Tag(name = "Especialidades")
@SecurityRequirement(name = "bearerAuth")
public class SpecialtyController {

    private final SpecialtyRepository specialtyRepository;

    @GetMapping
    @Operation(summary = "Lista especialidades ativas")
    public ResponseEntity<List<Specialty>> findAll() {
        return ResponseEntity.ok(specialtyRepository.findAllByActiveTrue());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Specialty> findById(@PathVariable Long id) {
        return ResponseEntity.ok(specialtyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Especialidade não encontrada: " + id)));
    }

    /**
     * Cria uma nova especialidade (somente ADMIN)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cria especialidade (ADMIN)")
    public ResponseEntity<Specialty> create(@RequestBody Specialty specialty) {
        // Tratamento de segurança para o campo active
        if (specialty.getActive() == null) {
            specialty.setActive(true);
        }

        // Verifica duplicidade de nome (case insensitive)
        if (specialtyRepository.existsByNameIgnoreCase(specialty.getName())) {
            throw new ConflictException("Especialidade já existe: " + specialty.getName());
        }

        Specialty saved = specialtyRepository.save(specialty);
        return ResponseEntity.status(201).body(saved);
    }

    /**
     * Atualiza uma especialidade existente (somente ADMIN)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Specialty> update(@PathVariable Long id, @RequestBody Specialty req) {
        Specialty existing = specialtyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Especialidade não encontrada: " + id));

        // Atualiza apenas os campos enviados
        existing.setName(req.getName());
        existing.setDescription(req.getDescription());

        // Só atualiza o status 'active' se ele for enviado no request
        if (req.getActive() != null) {
            existing.setActive(req.getActive());
        }

        Specialty updated = specialtyRepository.save(existing);
        return ResponseEntity.ok(updated);
    }
}