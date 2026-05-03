package com.nexocriminal.domain.alerta;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/alertas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AlertaController {

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