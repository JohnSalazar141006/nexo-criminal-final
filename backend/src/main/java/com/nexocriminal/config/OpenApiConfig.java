package com.nexocriminal.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI nexoCriminalOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Nexo Criminal API")
                        .description("API REST de la plataforma de inteligencia criminal. " +
                                "Gestión de personas, vehículos, sucesos, desapariciones, " +
                                "motor de detección Red Thread y análisis con IA.")
                        .version("1.0.0")
                        .contact(new Contact().name("Equipo Amarillo — UDO Nueva Esparta")));
    }
}