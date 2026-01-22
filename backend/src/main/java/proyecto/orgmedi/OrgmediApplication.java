package proyecto.orgmedi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Aplicación principal de OrgMedi
 * Build trigger: Force backend rebuild with AuthController fixes (2026-01-22 19:45)
 */
@SpringBootApplication
public class OrgmediApplication {

    public static void main(String[] args) {
        SpringApplication.run(OrgmediApplication.class, args);
    }

}
