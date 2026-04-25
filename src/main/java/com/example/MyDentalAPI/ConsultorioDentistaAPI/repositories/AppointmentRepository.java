package com.example.MyDentalAPI.ConsultorioDentistaAPI.repositories;

import com.example.MyDentalAPI.ConsultorioDentistaAPI.entities.Appointment;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.enums.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    Page<Appointment> findAllByPatientId(Long patientId, Pageable pageable);
    Page<Appointment> findAllByDentistId(Long dentistId, Pageable pageable);

    List<Appointment> findAllByDentistIdAndScheduledAtBetween(
            Long dentistId, LocalDateTime start, LocalDateTime end);

    List<Appointment> findAllByScheduledAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT a FROM Appointment a WHERE a.dentist.id = :dentistId " +
            "AND a.status NOT IN ('CANCELADO', 'NAO_COMPARECEU') " +
            "AND a.scheduledAt < :end " +
            "AND FUNCTION('TIMESTAMPADD', MINUTE, a.durationMinutes, a.scheduledAt) > :start")
    List<Appointment> findConflicts(@Param("dentistId") Long dentistId,
                                    @Param("start") LocalDateTime start,
                                    @Param("end") LocalDateTime end);

    @Query("SELECT a FROM Appointment a WHERE a.status = :status " +
            "AND a.scheduledAt BETWEEN :start AND :end " +
            "ORDER BY a.scheduledAt ASC")
    List<Appointment> findByStatusAndDateRange(@Param("status") AppointmentStatus status,
                                               @Param("start") LocalDateTime start,
                                               @Param("end") LocalDateTime end);

    long countByDentistIdAndScheduledAtBetween(Long dentistId, LocalDateTime start, LocalDateTime end);
    long countByStatus(AppointmentStatus status);
}