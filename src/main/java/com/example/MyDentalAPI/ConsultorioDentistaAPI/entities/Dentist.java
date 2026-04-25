package com.example.MyDentalAPI.ConsultorioDentistaAPI.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "dentists")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Dentist extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, unique = true, length = 20)
    private String cro;

    @Column(name = "cro_state", nullable = false, length = 2)
    private String croState;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specialty_id", nullable = false)
    private Specialty specialty;

    @Column(length = 20)
    private String phone;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private Boolean active = true;
}