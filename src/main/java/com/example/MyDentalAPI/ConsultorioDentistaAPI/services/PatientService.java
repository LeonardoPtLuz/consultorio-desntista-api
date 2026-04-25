package com.example.MyDentalAPI.ConsultorioDentistaAPI.services;

import com.example.MyDentalAPI.ConsultorioDentistaAPI.dto.request.PatientRequest;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.entities.Patient;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.exception.GlobalExceptionHandler.*;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.repositories.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;

    public Page<Patient> findAll(String search, Pageable pageable) {
        if (search != null && !search.isBlank())
            return patientRepository.search(search.trim(), pageable);
        return patientRepository.findAllByActiveTrue(pageable);
    }

    public Patient findById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente não encontrado: " + id));
    }

    public Patient findByCpf(String cpf) {
        return patientRepository.findByCpf(cpf)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente não encontrado com CPF: " + cpf));
    }

    @Transactional
    public Patient create(PatientRequest req) {
        if (patientRepository.existsByCpf(req.cpf()))
            throw new ConflictException("CPF já cadastrado: " + req.cpf());
        return patientRepository.save(toEntity(new Patient(), req));
    }

    @Transactional
    public Patient update(Long id, PatientRequest req) {
        Patient patient = findById(id);
        if (!patient.getCpf().equals(req.cpf()) && patientRepository.existsByCpf(req.cpf()))
            throw new ConflictException("CPF já cadastrado: " + req.cpf());
        return patientRepository.save(toEntity(patient, req));
    }

    @Transactional
    public void deactivate(Long id) {
        Patient patient = findById(id);
        patient.setActive(false);
        patientRepository.save(patient);
    }

    private Patient toEntity(Patient p, PatientRequest r) {
        p.setName(r.name());
        p.setCpf(r.cpf().replaceAll("[^0-9]", ""));
        p.setBirthDate(r.birthDate());
        p.setGender(r.gender());
        p.setPhone(r.phone());
        p.setEmail(r.email());
        p.setAddressStreet(r.addressStreet());
        p.setAddressNumber(r.addressNumber());
        p.setAddressDistrict(r.addressDistrict());
        p.setAddressCity(r.addressCity());
        p.setAddressState(r.addressState());
        p.setAddressZip(r.addressZip());
        p.setHealthPlan(r.healthPlan());
        p.setHealthPlanNumber(r.healthPlanNumber());
        p.setAllergies(r.allergies());
        p.setObservations(r.observations());
        return p;
    }
}
