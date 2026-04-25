package com.example.MyDentalAPI.ConsultorioDentistaAPI.controller;

import com.example.MyDentalAPI.ConsultorioDentistaAPI.dto.request.PaymentRequest;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.entities.Payment;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.services.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Pagamentos")
@SecurityRequirement(name = "bearerAuth")
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping
    @Operation(summary = "Lista todos os pagamentos")
    public ResponseEntity<Page<Payment>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(paymentService.findAll(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca pagamento por ID")
    public ResponseEntity<Payment> findById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.findById(id));
    }

    @GetMapping("/patient/{patientId}")
    @Operation(summary = "Pagamentos de um paciente")
    public ResponseEntity<Page<Payment>> findByPatient(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(paymentService.findByPatient(patientId, PageRequest.of(page, size)));
    }

    @PostMapping
    @Operation(summary = "Registra novo pagamento")
    public ResponseEntity<Payment> create(@Valid @RequestBody PaymentRequest request) {
        Payment created = paymentService.create(request);
        return ResponseEntity.created(URI.create("/api/payments/" + created.getId())).body(created);
    }

    @PatchMapping("/{id}/confirm")
    @Operation(summary = "Confirma recebimento do pagamento")
    public ResponseEntity<Payment> confirm(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.confirm(id));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancela ou estorna pagamento")
    public ResponseEntity<Payment> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.cancel(id));
    }

    @GetMapping("/revenue")
    @Operation(summary = "Receita total de um mês/ano")
    public ResponseEntity<Map<String, Object>> revenue(
            @RequestParam int year,
            @RequestParam int month) {
        BigDecimal total = paymentService.revenueByMonth(year, month);
        return ResponseEntity.ok(Map.of("year", year, "month", month, "total", total));
    }
}
