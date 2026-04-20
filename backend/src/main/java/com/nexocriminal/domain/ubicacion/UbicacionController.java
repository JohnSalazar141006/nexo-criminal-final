package com.nexocriminal.domain.ubicacion;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ubicaciones")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UbicacionController {

    private final UbicacionService service;

    @GetMapping
    public List<Ubicacion> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public Ubicacion obtener(@PathVariable Long id) {
        return service.obtener(id);
    }

    @PostMapping
    public ResponseEntity<Ubicacion> crear(@Valid @RequestBody Ubicacion u) {
        return ResponseEntity.ok(service.crear(u));
    }

    @PutMapping("/{id}")
    public Ubicacion actualizar(@PathVariable Long id, @Valid @RequestBody Ubicacion u) {
        return service.actualizar(id, u);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
