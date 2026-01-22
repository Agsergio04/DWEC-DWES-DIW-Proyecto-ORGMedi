package proyecto.orgmedi.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuración de OpenAPI/Swagger para documentación interactiva de la API.
 * 
 * Endpoints disponibles:
 * - GET /api/docs - OpenAPI JSON spec
 * - GET /api/swagger-ui.html - Interfaz interactiva de Swagger
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("ORGMedi API")
                        .version("0.0.2")
                        .description("API REST para la gestión y organización de medicamentos")
                        .contact(new Contact()
                                .name("ORGMedi Team")
                                .email("support@orgmedi.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .addServersItem(new Server()
                        .url("http://localhost:8080")
                        .description("Servidor de desarrollo"))
                .addServersItem(new Server()
                        .url("https://orgmedi-backend.onrender.com")
                        .description("Servidor de producción"));
    }
}
