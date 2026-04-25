package com.example.MyDentalAPI.ConsultorioDentistaAPI.controller;

import com.example.MyDentalAPI.ConsultorioDentistaAPI.dto.request.DentistRequest;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.entities.Dentist;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.services.DentistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/dentists")
@RequiredArgsConstructor
@Tag(name = "Dentistas")
@SecurityRequirement(name = "bearerAuth")
public class DentistController {

    private final DentistService dentistService;

    @GetMapping
    @Operation(summary = "Lista todos os dentistas ativos")
    public ResponseEntity<List<Dentist>> findAll() {
        return ResponseEntity.ok(dentistService.findAll());
    }

    @GetMapping("/search")
    @Operation(summary = "Busca dentistas por nome ou CRO")
    public ResponseEntity<Page<Dentist>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(dentistService.search(q, PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca dentista por ID")
    public ResponseEntity<Dentist> findById(@PathVariable Long id) {
        return ResponseEntity.ok(dentistService.findById(id));
    }

    @GetMapping("/specialty/{specialtyId}")
    @Operation(summary = "Lista dentistas por especialidade")
    public ResponseEntity<List<Dentist>> findBySpecialty(@PathVariable Long specialtyId) {
        return ResponseEntity.ok(dentistService.findBySpecialty(specialtyId));
    }

    @PostMapping
    @Operation(summary = "Cadastra novo dentista")
    public ResponseEntity<Dentist> create(@Valid @RequestBody DentistRequest request) {
        Dentist created = dentistService.create(request);
        return ResponseEntity.created(URI.create("/api/dentists/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza dados do dentista")
    public ResponseEntity<Dentist> update(@PathVariable Long id, @Valid @RequestBody DentistRequest request) {
        return ResponseEntity.ok(dentistService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Desativa dentista")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        dentistService.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
