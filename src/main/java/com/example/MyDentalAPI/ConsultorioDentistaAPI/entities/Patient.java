package com.example.MyDentalAPI.ConsultorioDentistaAPI.entities;

import com.example.MyDentalAPI.ConsultorioDentistaAPI.enums.Gender;
import jakarta.persistence.*;
import jakarta.persistence.Entity;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "patients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, unique = true, length = 14)
    private String cpf;

    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Gender gender;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(length = 150)
    private String email;

    // Endereço
    @Column(name = "address_street", length = 200) private String addressStreet;
    @Column(name = "address_number", length = 20)  private String addressNumber;
    @Column(name = "address_district", length = 100) private String addressDistrict;
    @Column(name = "address_city", length = 100) private String addressCity;
    @Column(name = "address_state", length = 2)   private String addressState;
    @Column(name = "address_zip", length = 9)     private String addressZip;

    // Plano de saúde
    @Column(name = "health_plan", length = 100) private String healthPlan;
    @Column(name = "health_plan_number", length = 50) private String healthPlanNumber;

    // Informações médicas
    @Column(columnDefinition = "TEXT") private String allergies;
    @Column(columnDefinition = "TEXT") private String observations;

    @Column(nullable = false)
    private Boolean active = true;
}
