package com.example.MyDentalAPI.ConsultorioDentistaAPI.repositories;

import com.example.MyDentalAPI.ConsultorioDentistaAPI.entities.Dentist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface DentistRepository extends JpaRepository<Dentist, Long> {
    Optional<Dentist> findByCro(String cro);
    boolean existsByCro(String cro);
    boolean existsByEmail(String email);
    List<Dentist> findAllByActiveTrue();

    @Query("SELECT d FROM Dentist d WHERE d.active = true AND d.specialty.id = :specialtyId")
    List<Dentist> findBySpecialtyId(@Param("specialtyId") Long specialtyId);

    @Query("SELECT d FROM Dentist d WHERE d.active = true AND " +
            "(LOWER(d.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(d.cro) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Dentist> searchActive(@Param("search") String search, Pageable pageable);
}
