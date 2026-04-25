package com.example.MyDentalAPI.ConsultorioDentistaAPI.services;

import com.example.MyDentalAPI.ConsultorioDentistaAPI.dto.request.PaymentRequest;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.entities.Payment;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.enums.PaymentStatus;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.exception.GlobalExceptionHandler.*;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.*;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository     paymentRepository;
    private final PatientRepository     patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalRecordRepository medicalRecordRepository;

    public Page<Payment> findAll(Pageable pageable) {
        return paymentRepository.findAll(pageable);
    }

    public Page<Payment> findByPatient(Long patientId, Pageable pageable) {
        return paymentRepository.findAllByPatientId(patientId, pageable);
    }

    public Payment findById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pagamento não encontrado: " + id));
    }

    @Transactional
    public Payment create(PaymentRequest req) {
        BigDecimal discount = req.discount() != null ? req.discount() : BigDecimal.ZERO;
        BigDecimal total    = req.amount().subtract(discount);
        if (total.compareTo(BigDecimal.ZERO) < 0)
            throw new BusinessException("Desconto não pode ser maior que o valor cobrado");

        Payment p = new Payment();
        p.setPatient(patientRepository.findById(req.patientId())
                .orElseThrow(() -> new ResourceNotFoundException("Paciente não encontrado")));
        if (req.appointmentId() != null)
            p.setAppointment(appointmentRepository.findById(req.appointmentId()).orElse(null));
        if (req.medicalRecordId() != null)
            p.setMedicalRecord(medicalRecordRepository.findById(req.medicalRecordId()).orElse(null));
        p.setAmount(req.amount());
        p.setDiscount(discount);
        p.setTotal(total);
        p.setPaymentMethod(req.paymentMethod());
        p.setStatus(PaymentStatus.PENDENTE);
        p.setNotes(req.notes());
        return paymentRepository.save(p);
    }

    @Transactional
    public Payment confirm(Long id) {
        Payment p = findById(id);
        if (p.getStatus() != PaymentStatus.PENDENTE)
            throw new BusinessException("Apenas pagamentos pendentes podem ser confirmados");
        p.setStatus(PaymentStatus.PAGO);
        p.setPaidAt(LocalDateTime.now());
        return paymentRepository.save(p);
    }

    @Transactional
    public Payment cancel(Long id) {
        Payment p = findById(id);
        if (p.getStatus() == PaymentStatus.ESTORNADO)
            throw new BusinessException("Pagamento já estornado");
        p.setStatus(p.getStatus() == PaymentStatus.PAGO ? PaymentStatus.ESTORNADO : PaymentStatus.CANCELADO);
        return paymentRepository.save(p);
    }

    public BigDecimal revenueByMonth(int year, int month) {
        LocalDateTime start = LocalDateTime.of(year, month, 1, 0, 0);
        LocalDateTime end   = start.plusMonths(1);
        return paymentRepository.sumPaidBetween(start, end);
    }
}
