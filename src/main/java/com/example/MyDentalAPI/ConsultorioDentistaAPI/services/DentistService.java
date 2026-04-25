package com.example.MyDentalAPI.ConsultorioDentistaAPI.services;

import com.example.MyDentalAPI.ConsultorioDentistaAPI.dto.request.DentistRequest;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.entities.Dentist;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.exception.GlobalExceptionHandler.*;
import com.example.MyDentalAPI.ConsultorioDentistaAPI.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DentistService {

    private final DentistRepository dentistRepository;
    private final SpecialtyRepository specialtyRepository;
    private final UserRepository userRepository;

    public List<Dentist> findAll() {
        return dentistRepository.findAllByActiveTrue();
    }

    public Page<Dentist> search(String search, Pageable pageable) {
        return dentistRepository.searchActive(search, pageable);
    }

    public Dentist findById(Long id) {
        return dentistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dentista não encontrado: " + id));
    }

    public List<Dentist> findBySpecialty(Long specialtyId) {
        return dentistRepository.findBySpecialtyId(specialtyId);
    }

    @Transactional
    public Dentist create(DentistRequest req) {
        if (dentistRepository.existsByCro(req.cro()))
            throw new ConflictException("CRO já cadastrado: " + req.cro());
        if (dentistRepository.existsByEmail(req.email()))
            throw new ConflictException("Email já cadastrado: " + req.email());
        return dentistRepository.save(toEntity(new Dentist(), req));
    }

    @Transactional
    public Dentist update(Long id, DentistRequest req) {
        Dentist dentist = findById(id);
        if (!dentist.getCro().equals(req.cro()) && dentistRepository.existsByCro(req.cro()))
            throw new ConflictException("CRO já cadastrado: " + req.cro());
        return dentistRepository.save(toEntity(dentist, req));
    }

    @Transactional
    public void deactivate(Long id) {
        Dentist dentist = findById(id);
        dentist.setActive(false);
        dentistRepository.save(dentist);
    }

    private Dentist toEntity(Dentist d, DentistRequest r) {
        d.setName(r.name());
        d.setCro(r.cro());
        d.setCroState(r.croState().toUpperCase());
        d.setPhone(r.phone());
        d.setEmail(r.email());
        d.setSpecialty(specialtyRepository.findById(r.specialtyId())
                .orElseThrow(() -> new ResourceNotFoundException("Especialidade não encontrada: " + r.specialtyId())));
        if (r.userId() != null)
            d.setUser(userRepository.findById(r.userId())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + r.userId())));
        return d;
    }
}
