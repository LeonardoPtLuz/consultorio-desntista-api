package com.example.MyDentalAPI.ConsultorioDentistaAPI.services;

import com.example.MyDentalAPI.ConsultorioDentistaAPI.dto.request.AppointmentRequest;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.entities.*;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.enums.AppointmentStatus;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.exception.GlobalExceptionHandler.*;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository     patientRepository;
    private final DentistRepository     dentistRepository;
    private final TreatmentRepository   treatmentRepository;
    private final UserRepository        userRepository;

    public Page<Appointment> findAll(Pageable pageable) {
        return appointmentRepository.findAll(pageable);
    }

    public Page<Appointment> findByPatient(Long patientId, Pageable pageable) {
        return appointmentRepository.findAllByPatientId(patientId, pageable);
    }

    public Page<Appointment> findByDentist(Long dentistId, Pageable pageable) {
        return appointmentRepository.findAllByDentistId(dentistId, pageable);
    }

    public List<Appointment> findByDentistAndDate(Long dentistId, LocalDateTime start, LocalDateTime end) {
        return appointmentRepository.findAllByDentistIdAndScheduledAtBetween(dentistId, start, end);
    }

    public List<Appointment> findByDateRange(LocalDateTime start, LocalDateTime end) {
        return appointmentRepository.findAllByScheduledAtBetween(start, end);
    }

    public Appointment findById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento não encontrado: " + id));
    }

    @Transactional
    public Appointment create(AppointmentRequest req) {
        int duration = req.durationMinutes() != null ? req.durationMinutes() : 30;
        checkConflicts(req.dentistId(), req.scheduledAt(), duration, null);

        Appointment a = new Appointment();
        a.setPatient(patientRepository.findById(req.patientId())
                .orElseThrow(() -> new ResourceNotFoundException("Paciente não encontrado: " + req.patientId())));
        a.setDentist(dentistRepository.findById(req.dentistId())
                .orElseThrow(() -> new ResourceNotFoundException("Dentista não encontrado: " + req.dentistId())));
        if (req.treatmentId() != null)
            a.setTreatment(treatmentRepository.findById(req.treatmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Tratamento não encontrado: " + req.treatmentId())));
        a.setScheduledAt(req.scheduledAt());
        a.setDurationMinutes(duration);
        a.setNotes(req.notes());
        a.setStatus(AppointmentStatus.AGENDADO);
        a.setCreatedBy(currentUser());
        return appointmentRepository.save(a);
    }

    @Transactional
    public Appointment update(Long id, AppointmentRequest req) {
        Appointment a = findById(id);
        int duration = req.durationMinutes() != null ? req.durationMinutes() : a.getDurationMinutes();
        checkConflicts(req.dentistId(), req.scheduledAt(), duration, id);

        a.setPatient(patientRepository.findById(req.patientId())
                .orElseThrow(() -> new ResourceNotFoundException("Paciente não encontrado")));
        a.setDentist(dentistRepository.findById(req.dentistId())
                .orElseThrow(() -> new ResourceNotFoundException("Dentista não encontrado")));
        if (req.treatmentId() != null)
            a.setTreatment(treatmentRepository.findById(req.treatmentId()).orElse(null));
        a.setScheduledAt(req.scheduledAt());
        a.setDurationMinutes(duration);
        a.setNotes(req.notes());
        return appointmentRepository.save(a);
    }

    @Transactional
    public Appointment updateStatus(Long id, AppointmentStatus status) {
        Appointment a = findById(id);
        validateStatusTransition(a.getStatus(), status);
        a.setStatus(status);
        return appointmentRepository.save(a);
    }

    @Transactional
    public void cancel(Long id, String reason) {
        Appointment a = findById(id);
        if (a.getStatus() == AppointmentStatus.CONCLUIDO)
            throw new BusinessException("Não é possível cancelar uma consulta já concluída");
        a.setStatus(AppointmentStatus.CANCELADO);
        a.setNotes((a.getNotes() != null ? a.getNotes() + "\n" : "") + "Cancelado: " + reason);
        appointmentRepository.save(a);
    }

    private void checkConflicts(Long dentistId, LocalDateTime start, int durationMinutes, Long excludeId) {
        LocalDateTime end = start.plusMinutes(durationMinutes);
        List<Appointment> conflicts = appointmentRepository.findConflicts(dentistId, start, end);
        if (excludeId != null) conflicts.removeIf(a -> a.getId().equals(excludeId));
        if (!conflicts.isEmpty())
            throw new ConflictException(
                    "Dentista já possui agendamento neste horário: " + start);
    }

    private void validateStatusTransition(AppointmentStatus current, AppointmentStatus next) {
        if (current == AppointmentStatus.CANCELADO || current == AppointmentStatus.CONCLUIDO)
            throw new BusinessException("Não é possível alterar status de consulta " + current.name().toLowerCase());
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElse(null);
    }
}