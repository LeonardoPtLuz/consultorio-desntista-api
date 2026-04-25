package com.example.MyDentalAPI.ConsultorioDentistaAPI.repositories;

import com.example.MyDentalAPI.ConsultorioDentistaAPI.entities.Payment;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Page<Payment> findAllByPatientId(Long patientId, Pageable pageable);
    List<Payment> findAllByStatus(PaymentStatus status);

    @Query("SELECT COALESCE(SUM(p.total), 0) FROM Payment p WHERE p.status = 'PAGO' " +
            "AND p.paidAt BETWEEN :start AND :end")
    BigDecimal sumPaidBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}