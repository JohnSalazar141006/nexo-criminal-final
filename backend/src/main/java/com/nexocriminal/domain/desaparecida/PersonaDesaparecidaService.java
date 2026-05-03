package com.nexocriminal.domain.desaparecida;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PersonaDesaparecidaService {

    private final PersonaDesaparecidaRepository repository;

    public PersonaDesaparecida crear(PersonaDesaparecida p) {
        p.setCreadoEn(LocalDateTime.now());
        p.setActualizadoEn(LocalDateTime.now());
        return repository.save(p);
    }

    public PersonaDesaparecida actualizar(Long id, PersonaDesaparecida datos) {
        PersonaDesaparecida existente = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Persona desaparecida no encontrada: " + id));

        // Mantener fecha de creación
        datos.setId(id);
        datos.setCreadoEn(existente.getCreadoEn());
        datos.setActualizadoEn(LocalDateTime.now());

        // Si cambió a estado encontrada/archivada, marcar fecha de resolución
        if (datos.getEstado() != EstadoDesaparicion.BUSCADA && existente.getFechaResolucion() == null) {
            datos.setFechaResolucion(LocalDateTime.now());
        }

        return repository.save(datos);
    }

    public PersonaDesaparecida cambiarEstado(Long id, EstadoDesaparicion nuevoEstado) {
        PersonaDesaparecida p = obtener(id);
        p.setEstado(nuevoEstado);
        p.setActualizadoEn(LocalDateTime.now());
        if (nuevoEstado != EstadoDesaparicion.BUSCADA && p.getFechaResolucion() == null) {
            p.setFechaResolucion(LocalDateTime.now());
        }
        return repository.save(p);
    }

    public PersonaDesaparecida actualizarFotoUrl(Long id, String url) {
        PersonaDesaparecida p = obtener(id);
        p.setFotoUrl(url);
        p.setActualizadoEn(LocalDateTime.now());
        return repository.save(p);
    }

    public PersonaDesaparecida guardarAnalisisIA(Long id, String analisis) {
        PersonaDesaparecida p = obtener(id);
        p.setAnalisisIA(analisis);
        p.setActualizadoEn(LocalDateTime.now());
        return repository.save(p);
    }

    public PersonaDesaparecida guardarZonasBusquedaIA(Long id, String zonas) {
        PersonaDesaparecida p = obtener(id);
        p.setZonasBusquedaIA(zonas);
        p.setActualizadoEn(LocalDateTime.now());
        return repository.save(p);
    }

    @Transactional(readOnly = true)
    public List<PersonaDesaparecida> listar() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public List<PersonaDesaparecida> listarPorEstado(EstadoDesaparicion estado) {
        return repository.findByEstado(estado);
    }

    @Transactional(readOnly = true)
    public List<PersonaDesaparecida> listarPorPrioridad(PrioridadDesaparicion prioridad) {
        return repository.findByPrioridad(prioridad);
    }

    @Transactional(readOnly = true)
    public PersonaDesaparecida obtener(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Persona desaparecida no encontrada: " + id));
    }

    @Transactional(readOnly = true)
    public List<PersonaDesaparecida> buscarEnRadio(double lat, double lng, int radioMetros) {
        return repository.findEnRadio(lat, lng, radioMetros);
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}