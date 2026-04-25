package com.example.MyDentalAPI.ConsultorioDentistaAPI.repositories;

import com.example.MyDentalAPI.ConsultorioDentistaAPI.entities.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByCpf(String cpf);
    boolean existsByCpf(String cpf);

    @Query("SELECT p FROM Patient p WHERE p.active = true AND (" +
            "LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "p.cpf LIKE CONCAT('%', :search, '%') OR " +
            "p.phone LIKE CONCAT('%', :search, '%'))")
    Page<Patient> search(@Param("search") String search, Pageable pageable);

    Page<Patient> findAllByActiveTrue(Pageable pageable);
}
