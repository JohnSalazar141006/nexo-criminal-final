package com.nexocriminal.domain.suceso;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sucesos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SucesoController {

    private final SucesoService service;

    @GetMapping
    public List<Suceso> listar(@RequestParam(required = false) TipoSuceso tipo) {
        return (tipo != null) ? service.listarPorTipo(tipo) : service.listar();
    }

    @GetMapping("/{id}")
    public Suceso obtener(@PathVariable Long id) {
        return service.obtener(id);
    }

    @PostMapping
    public ResponseEntity<Suceso> crear(@Valid @RequestBody Suceso s) {
        return ResponseEntity.ok(service.crear(s));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
