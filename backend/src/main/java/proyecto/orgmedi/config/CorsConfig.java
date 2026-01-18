package proyecto.orgmedi.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuración de CORS (Cross-Origin Resource Sharing)
 * Permite que el frontend en localhost:4200 acceda a los endpoints del backend
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                // Orígenes permitidos
                .allowedOrigins(
                        "http://localhost",
                        "http://localhost:80",
                        "http://localhost:4200",
                        "http://127.0.0.1",
                        "http://127.0.0.1:4200"
                )
                // Métodos HTTP permitidos
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                // Headers permitidos
                .allowedHeaders("*")
                // Permitir credenciales (cookies, JWT)
                .allowCredentials(true)
                // Tiempo de cache de preflight (segundos)
                .maxAge(3600);
    }
}
