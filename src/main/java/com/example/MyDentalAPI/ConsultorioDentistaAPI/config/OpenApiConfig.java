package com.example.MyDentalAPI.ConsultorioDentistaAPI.config;

import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.*;
import io.swagger.v3.oas.models.security.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("🦷 Dental Clinic API")
                        .description("API REST completa para gerenciamento de consultório odontológico.\n\n" +
                                "**Credenciais padrão:** `admin@dental.com` / `Admin@123`")
                        .version("1.0.0")
                        .contact(new Contact().name("Dental Clinic").email("dev@dental.com"))
                        .license(new License().name("MIT")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .name("bearerAuth")
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Insira o token JWT obtido no endpoint /api/auth/login")));
    }
}
