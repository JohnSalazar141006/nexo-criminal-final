package com.nexocriminal.domain.persona;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/personas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PersonaController {

    private final PersonaService service;

    @GetMapping
    public List<Persona> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public Persona obtener(@PathVariable Long id) {
        return service.obtener(id);
    }

    @PostMapping
    public ResponseEntity<Persona> crear(@Valid @RequestBody Persona persona) {
        Persona creada = service.crear(persona);
        return ResponseEntity.ok(creada);
    }

    @PutMapping("/{id}")
    public Persona actualizar(@PathVariable Long id, @Valid @RequestBody Persona persona) {
        return service.actualizar(id, persona);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/intermediarios")
    public List<Persona> intermediarios(@RequestParam Long victimaId,
                                        @RequestParam Long sospechosoId) {
        return service.buscarIntermediarios(victimaId, sospechosoId);
    }
}
