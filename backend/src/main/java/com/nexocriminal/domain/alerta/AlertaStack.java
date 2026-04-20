package com.nexocriminal.domain.alerta;

import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Repository
interface AlertaRepository extends JpaRepository<Alerta, Long> {
    List<Alerta> findByEstado(EstadoAlerta estado);
}

@Service
@RequiredArgsConstructor
@Transactional
class AlertaService {

    private final AlertaRepository repository;

    public Alerta crear(Alerta a) { return repository.save(a); }

    @Transactional(readOnly = true)
    public List<Alerta> listar() { return repository.findAll(); }

    @Transactional(readOnly = true)
    public List<Alerta> pendientes() { return repository.findByEstado(EstadoAlerta.PENDIENTE); }

    public Alerta cambiarEstado(Long id, EstadoAlerta estado) {
        Alerta a = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Alerta no encontrada"));
        a.setEstado(estado);
        return repository.save(a);
    }
}

@RestController
@RequestMapping("/api/v1/alertas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
class AlertaController {

    private final AlertaService service;

    @GetMapping
    public List<Alerta> listar(@RequestParam(required = false) Boolean pendientes) {
        return Boolean.TRUE.equals(pendientes) ? service.pendientes() : service.listar();
    }

    @PatchMapping("/{id}/estado")
    public Alerta cambiarEstado(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return service.cambiarEstado(id, EstadoAlerta.valueOf(body.get("estado")));
    }
}
