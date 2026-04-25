package com.example.MyDentalAPI.ConsultorioDentistaAPI.repositories;

import com.example.MyDentalAPI.ConsultorioDentistaAPI.entities.Specialty;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SpecialtyRepository extends JpaRepository<Specialty, Long> {
    List<Specialty> findAllByActiveTrue();
    boolean existsByNameIgnoreCase(String name);
}
