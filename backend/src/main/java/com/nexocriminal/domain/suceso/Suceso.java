package com.nexocriminal.domain.suceso;

import com.nexocriminal.domain.persona.Persona;
import com.nexocriminal.domain.ubicacion.Ubicacion;
import com.nexocriminal.domain.vehiculo.Vehiculo;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "suceso")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Suceso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TipoSuceso tipo;

    @NotNull
    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ubicacion_id")
    private Ubicacion ubicacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ubicacion_ultima_id")
    private Ubicacion ubicacionUltima;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehiculo_id")
    private Vehiculo vehiculo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "victima_id")
    private Persona victima;

    @Column(name = "modus_operandi", length = 100)
    private String modusOperandi;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "patron_banda_id")
    private Long patronBandaId;

    @Column(name = "creado_en", updatable = false)
    @Builder.Default
    private LocalDateTime creadoEn = LocalDateTime.now();
}
