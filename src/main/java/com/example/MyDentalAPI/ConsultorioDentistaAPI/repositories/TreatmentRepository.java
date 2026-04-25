package com.example.MyDentalAPI.ConsultorioDentistaAPI.repositories;

import com.example.MyDentalAPI.ConsultorioDentistaAPI.entities.Treatment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TreatmentRepository extends JpaRepository<Treatment, Long> {
    List<Treatment> findAllByActiveTrue();
    List<Treatment> findAllBySpecialtyIdAndActiveTrue(Long specialtyId);
}
