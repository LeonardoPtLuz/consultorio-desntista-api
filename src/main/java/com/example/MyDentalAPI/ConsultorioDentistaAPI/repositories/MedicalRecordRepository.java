package com.example.MyDentalAPI.ConsultorioDentistaAPI.repositories;

import com.example.MyDentalAPI.ConsultorioDentistaAPI.entities.MedicalRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    Page<MedicalRecord> findAllByPatientIdOrderByCreatedAtDesc(Long patientId, Pageable pageable);
    Page<MedicalRecord> findAllByDentistIdOrderByCreatedAtDesc(Long dentistId, Pageable pageable);
}
