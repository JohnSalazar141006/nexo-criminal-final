package com.nexocriminal.domain.vinculo;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/vinculos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VinculoController {

    private final VinculoRepository repository;

    @GetMapping
    public List<Vinculo> listar() {
        return repository.findAllActivos();
    }

    @GetMapping("/nodo/{tipo}/{id}")
    public List<Vinculo> porNodo(@PathVariable String tipo, @PathVariable Long id) {
        return repository.findByNodo(tipo.toUpperCase(), id);
    }
}
