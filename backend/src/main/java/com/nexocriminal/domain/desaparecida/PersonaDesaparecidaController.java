package com.nexocriminal.domain.desaparecida;

import com.nexocriminal.files.FileStorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/desaparecidas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PersonaDesaparecidaController {

    private final PersonaDesaparecidaService service;
    private final FileStorageService fileStorageService;

    @GetMapping
    public List<PersonaDesaparecida> listar(
            @RequestParam(required = false) EstadoDesaparicion estado,
            @RequestParam(required = false) PrioridadDesaparicion prioridad) {
        if (estado != null) return service.listarPorEstado(estado);
        if (prioridad != null) return service.listarPorPrioridad(prioridad);
        return service.listar();
    }

    @GetMapping("/{id}")
    public PersonaDesaparecida obtener(@PathVariable Long id) {
        return service.obtener(id);
    }

    @PostMapping
    public ResponseEntity<PersonaDesaparecida> crear(@Valid @RequestBody PersonaDesaparecida p) {
        return ResponseEntity.ok(service.crear(p));
    }

    @PutMapping("/{id}")
    public PersonaDesaparecida actualizar(@PathVariable Long id,
                                           @Valid @RequestBody PersonaDesaparecida p) {
        return service.actualizar(id, p);
    }

    @PatchMapping("/{id}/estado")
    public PersonaDesaparecida cambiarEstado(@PathVariable Long id,
                                              @RequestBody Map<String, String> body) {
        EstadoDesaparicion estado = EstadoDesaparicion.valueOf(body.get("estado"));
        return service.cambiarEstado(id, estado);
    }

    @PostMapping("/{id}/foto")
    public ResponseEntity<Map<String, String>> subirFoto(@PathVariable Long id,
                                                          @RequestParam("archivo") MultipartFile archivo) {
        try {
            // Eliminar foto anterior si existe
            PersonaDesaparecida actual = service.obtener(id);
            if (actual.getFotoUrl() != null) {
                fileStorageService.eliminarArchivo(actual.getFotoUrl());
            }

            String url = fileStorageService.guardarFotoDesaparecida(archivo);
            service.actualizarFotoUrl(id, url);
            return ResponseEntity.ok(Map.of("url", url));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Error al subir foto: " + e.getMessage()));
        }
    }

    @GetMapping("/cercanas")
    public List<PersonaDesaparecida> cercanas(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "5000") int radioMetros) {
        return service.buscarEnRadio(lat, lng, radioMetros);
    }

    @GetMapping("/estadisticas")
    public Map<String, Object> estadisticas() {
        List<PersonaDesaparecida> todas = service.listar();
        long buscadas = todas.stream().filter(p -> p.getEstado() == EstadoDesaparicion.BUSCADA).count();
        long encontradasVivas = todas.stream().filter(p -> p.getEstado() == EstadoDesaparicion.ENCONTRADA_VIVA).count();
        long encontradasFallecidas = todas.stream().filter(p -> p.getEstado() == EstadoDesaparicion.ENCONTRADA_FALLECIDA).count();
        long criticas = todas.stream()
                .filter(p -> p.getEstado() == EstadoDesaparicion.BUSCADA)
                .filter(p -> p.getPrioridad() == PrioridadDesaparicion.CRITICA)
                .count();

        return Map.of(
                "total", todas.size(),
                "buscadas", buscadas,
                "encontradasVivas", encontradasVivas,
                "encontradasFallecidas", encontradasFallecidas,
                "criticas", criticas
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        try {
            PersonaDesaparecida p = service.obtener(id);
            if (p.getFotoUrl() != null) {
                fileStorageService.eliminarArchivo(p.getFotoUrl());
            }
        } catch (Exception ignored) {}

        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}