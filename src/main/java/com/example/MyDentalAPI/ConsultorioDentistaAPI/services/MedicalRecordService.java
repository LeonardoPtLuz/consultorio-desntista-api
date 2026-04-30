package com.example.MyDentalAPI.ConsultorioDentistaAPI.services;

import com.example.MyDentalAPI.ConsultorioDentistaAPI.dto.request.MedicalRecordRequest;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.entities.MedicalRecord;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.exception.GlobalExceptionHandler.*;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final PatientRepository       patientRepository;
    private final DentistRepository       dentistRepository;
    private final AppointmentRepository   appointmentRepository;
    private final TreatmentRepository     treatmentRepository;

    public Page<MedicalRecord> findByPatient(Long patientId, Pageable pageable) {
        return medicalRecordRepository.findAllByPatientIdOrderByCreatedAtDesc(patientId, pageable);
    }

    public Page<MedicalRecord> findByDentist(Long dentistId, Pageable pageable) {
        return medicalRecordRepository.findAllByDentistIdOrderByCreatedAtDesc(dentistId, pageable);
    }

    public MedicalRecord findById(Long id) {
        return medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prontuário não encontrado: " + id));
    }

    @Transactional
    public MedicalRecord create(MedicalRecordRequest req) {
        MedicalRecord r = new MedicalRecord();
        r.setPatient(patientRepository.findById(req.patientId())
                .orElseThrow(() -> new ResourceNotFoundException("Paciente não encontrado")));
        r.setDentist(dentistRepository.findById(req.dentistId())
                .orElseThrow(() -> new ResourceNotFoundException("Dentista não encontrado")));
        if (req.appointmentId() != null)
            r.setAppointment(appointmentRepository.findById(req.appointmentId()).orElse(null));
        if (req.treatmentId() != null)
            r.setTreatment(treatmentRepository.findById(req.treatmentId()).orElse(null));

        r.setDescription(req.description());
        r.setDiagnosis(req.diagnosis());
        r.setPrescription(req.prescription());
        r.setNextSteps(req.nextSteps());
        r.setToothNumber(req.toothNumber());
        r.setPriceCharged(req.priceCharged());

        return medicalRecordRepository.save(r);
    }

    @Transactional
    public MedicalRecord update(Long id, MedicalRecordRequest req) {
        MedicalRecord r = findById(id);
        r.setDescription(req.description());
        r.setDiagnosis(req.diagnosis());
        r.setPrescription(req.prescription());
        r.setNextSteps(req.nextSteps());
        r.setToothNumber(req.toothNumber());
        r.setPriceCharged(req.priceCharged());
        return medicalRecordRepository.save(r);
    }

    @Transactional
    public void delete(Long id) {
        MedicalRecord record = findById(id);
        medicalRecordRepository.delete(record);
    }
}