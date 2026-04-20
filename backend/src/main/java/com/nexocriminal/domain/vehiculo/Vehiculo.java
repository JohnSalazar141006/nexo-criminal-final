package com.nexocriminal.domain.vehiculo;

import com.nexocriminal.domain.persona.Persona;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "vehiculo")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Vehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(unique = true, nullable = false, length = 10)
    private String placa;

    @NotBlank
    @Column(nullable = false, length = 50)
    private String marca;

    @NotBlank
    @Column(nullable = false, length = 50)
    private String modelo;

    private Integer anio;

    @Column(length = 30)
    private String color;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    @Builder.Default
    private EstadoVehiculo estado = EstadoVehiculo.NORMAL;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "propietario_id")
    private Persona propietario;

    @Column(name = "creado_en", updatable = false)
    @Builder.Default
    private LocalDateTime creadoEn = LocalDateTime.now();
}
