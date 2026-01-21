package proyecto.orgmedi.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuración de CORS (Cross-Origin Resource Sharing)
 * Permite que el frontend acceda a los endpoints del backend
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        if (registry == null) {
            return;
        }
        
        // Obtener origen permitido de variable de entorno o usar valores por defecto
        String[] allowedOrigins = {
            // Desarrollo
            "http://localhost",
            "http://localhost:80",
            "http://localhost:4200",
            "http://localhost:3000",
            "http://127.0.0.1",
            "http://127.0.0.1:4200",
            "http://127.0.0.1:3000",
            // Producción en Render
            "https://dwec-dwes-diw-proyecto-orgmedi.onrender.com"
        };
        
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
