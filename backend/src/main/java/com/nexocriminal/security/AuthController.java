package com.nexocriminal.security;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        return usuarioRepository.findByUsername(username)
                .filter(u -> Boolean.TRUE.equals(u.getActivo()))
                .filter(u -> passwordEncoder.matches(password, u.getPasswordHash()))
                .map(u -> ResponseEntity.ok(Map.<String, Object>of(
                        "token", jwtService.generarToken(u.getUsername(), u.getRol()),
                        "username", u.getUsername(),
                        "nombreCompleto", u.getNombreCompleto() != null ? u.getNombreCompleto() : "",
                        "rol", u.getRol()
                )))
                .orElseGet(() -> ResponseEntity.status(401).body(Map.of("error", "Credenciales invalidas")));
    }

    @PostMapping("/registrar")
    public ResponseEntity<?> registrar(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        if (usuarioRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Usuario ya existe"));
        }
        Usuario u = Usuario.builder()
                .username(username)
                .passwordHash(passwordEncoder.encode(body.get("password")))
                .nombreCompleto(body.getOrDefault("nombreCompleto", ""))
                .rol("ANALISTA")
                .activo(true)
                .build();
        usuarioRepository.save(u);
        return ResponseEntity.ok(Map.of("mensaje", "Usuario creado"));
    }
}
