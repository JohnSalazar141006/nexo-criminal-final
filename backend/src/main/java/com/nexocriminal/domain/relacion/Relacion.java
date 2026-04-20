package com.nexocriminal.domain.relacion;

import com.nexocriminal.domain.persona.Persona;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "relacion")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Relacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "persona_a_id", nullable = false)
    private Persona personaA;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "persona_b_id", nullable = false)
    private Persona personaB;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_relacion", length = 30)
    private TipoRelacion tipoRelacion;

    @Builder.Default
    private Integer peso = 1;

    @Column(name = "creado_en", updatable = false)
    @Builder.Default
    private LocalDateTime creadoEn = LocalDateTime.now();
}
