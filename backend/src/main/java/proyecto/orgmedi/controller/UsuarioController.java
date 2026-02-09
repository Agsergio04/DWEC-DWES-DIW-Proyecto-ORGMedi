package proyecto.orgmedi.controller;

import jakarta.validation.Valid;
import proyecto.orgmedi.dominio.Usuario;
import proyecto.orgmedi.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

/**
 * Controlador UsuarioController - Endpoints REST para gestión de usuarios
 * 
 * PROPÓSITO: Recibir peticiones HTTP (GET, POST, PUT, DELETE) sobre usuarios
 * y delegarlas al servicio (UsuarioService) que maneja la lógica de negocio.
 * 
 * PATRÓN MVC: Controller → Service → Repository → BD
 * 
 * ENDPOINTS BASE: /api/usuarios
 * EJEMPLOS:
 * - GET /api/usuarios                    → Obtener todos
 * - GET /api/usuarios/5                  → Obtener usuario con ID 5
 * - POST /api/usuarios                   → Crear nuevo usuario
 * - PUT /api/usuarios/5                  → Actualizar usuario con ID 5
 * - DELETE /api/usuarios/5               → Eliminar usuario con ID 5
 * 
 * RESPONSABILIDADES:
 * - Mapear URL → método Java
 * - Parsear parámetros y cuerpo de petición
 * - Llamar al servicio (UsuarioService)
 * - Retornar respuesta HTTP (JSON + código de estado)
 * - Manejo de errores y excepciones
 */
@RestController // Anotación que marca esto como controlador REST (retorna JSON automáticamente)
@RequestMapping("/api/usuarios") // Base URL para todos los endpoints de este controlador
public class UsuarioController {
    
    // ============ ATRIBUTOS =============
    
    /**
     * Dependencia inyectada: UsuarioService
     * Se utiliza para acceder a la lógica de negocio
     */
    private final UsuarioService usuarioService;

    /**
     * Constructor con inyección de dependencia
     * Spring automáticamente proporciona una instancia de UsuarioService
     */
    @Autowired
    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    // ============ ENDPOINTS (MÉTODOS PÚBLICOS) =============
    
    /**
     * ENDPOINT: GET /api/usuarios
     * 
     * PROPÓSITO: Obtener la lista de TODOS los usuarios del sistema
     * 
     * MÉTODO HTTP: GET
     * PARÁMETROS: Ninguno
     * CUERPO: Ninguno
     * 
     * CÓDIGO RESPUESTA:
     * - 200 OK: Se devuelve lista de usuarios (puede estar vacía)
     * 
     * RESPUESTA JSON:
     * [
     *   { "id": 1, "correo": "juan@example.com", "usuario": "juan", ... },
     *   { "id": 2, "correo": "maria@example.com", "usuario": "maria", ... }
     * ]
     * 
     * NOTA: En un sistema real, se limitaría (paginación) por seguridad
     */
    @GetMapping
    public List<Usuario> getAllUsuarios() {
        return usuarioService.findAll();
    }

    /**
     * ENDPOINT: GET /api/usuarios/{id}
     * 
     * PROPÓSITO: Obtener un usuario específico por su ID
     * 
     * PARÁMETRO: id (en la URL, ejemplo: /api/usuarios/5)
     * 
     * CÓDIGO RESPUESTA:
     * - 200 OK: Usuario encontrado, se devuelve en JSON
     * - 404 Not Found: No existe usuario con ese ID
     * 
     * EJEMPLO:
     * GET /api/usuarios/1
     * Respuesta: { "id": 1, "correo": "juan@example.com", ... }
     * 
     * GET /api/usuarios/999
     * Respuesta: 404 Not Found - "Usuario no encontrado"
     */
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> getUsuarioById(@PathVariable Long id) {
        // @PathVariable extrae el {id} de la URL
        Usuario u = usuarioService.getByIdOrThrow(id); // Lanza 404 si no existe
        return ResponseEntity.ok(u); // Retorna 200 OK con el usuario
    }

    /**
     * ENDPOINT: POST /api/usuarios
     * 
     * PROPÓSITO: Crear un nuevo usuario en el sistema
     * 
     * CUERPO JSON:
     * {
     *   "correo": "nuevo@example.com",
     *   "usuario": "nuevo",
     *   "contrasena": "$2a$10$..." // Ya debe estar hasheada
     * }
     * 
     * VALIDACIONES (@Valid):
     * - correo: no null, válido como email, único
     * - usuario: no null, no vacío
     * - contrasena: no null, no vacío
     * 
     * CÓDIGO RESPUESTA:
     * - 201 Created: Usuario creado exitosamente (retorna usuario con ID generado)
     * - 400 Bad Request: Datos inválidos
     * - 409 Conflict: Correo ya registrado
     * 
     * EJEMPLO:
     * POST /api/usuarios
     * Body: { "correo": "juan@example.com", "usuario": "juan", "contrasena": "$2a$10$..." }
     * Respuesta: 201 Created - { "id": 10, "correo": "juan@example.com", ... }
     */
    @PostMapping
    public ResponseEntity<Usuario> createUsuario(@Valid @RequestBody Usuario usuario) {
        // @Valid ejecuta las validaciones anotadas en la clase Usuario
        // @RequestBody parsea el JSON al objeto Usuario
        Usuario saved = usuarioService.createUsuario(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        // CREATED = 201 (creado exitosamente)
    }

    /**
     * ENDPOINT: PUT /api/usuarios/{id}
     * 
     * PROPÓSITO: Actualizar información de un usuario existente
     * 
     * PARÁMETRO: id (en la URL)
     * CUERPO JSON: Campos a actualizar
     * {
     *   "usuario": "nuevoNombre",
     *   "correo": "nuevo@example.com",
     *   "contrasena": "$2a$10$..."
     * }
     * 
     * CÓDIGO RESPUESTA:
     * - 200 OK: Actualización exitosa
     * - 404 Not Found: Usuario no existe
     * 
     * NOTA: Solo actualiza campos que se proporcionen (no null)
     * 
     * EJEMPLO:
     * PUT /api/usuarios/5
     * Body: { "usuario": "juan2" }
     * Respuesta: 200 OK - { "id": 5, "usuario": "juan2", ... }
     */
    @PutMapping("/{id}")
    public ResponseEntity<Usuario> updateUsuario(@PathVariable Long id, @RequestBody Usuario usuario) {
        // @PathVariable extrae {id} de la URL
        // @RequestBody parsea el JSON (NO requiere @Valid, mejor flexibilidad)
        Usuario updated = usuarioService.updateUsuario(id, usuario);
        return ResponseEntity.ok(updated); // 200 OK
    }

    /**
     * ENDPOINT: DELETE /api/usuarios/{id}
     * 
     * PROPÓSITO: Eliminar un usuario del sistema
     * 
     * PARÁMETRO: id (en la URL)
     * 
     * CÓDIGO RESPUESTA:
     * - 204 No Content: Eliminación exitosa (sin cuerpo de respuesta)
     * - 404 Not Found: Usuario no existe
     * 
     * EFECTO LATERAL: Si tiene GestorMedicamentos, también se elimina en cascada
     * 
     * EJEMPLO:
     * DELETE /api/usuarios/5
     * Respuesta: 204 No Content (vacío)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUsuario(@PathVariable Long id) {
        usuarioService.deleteByIdOrThrow(id); // Lanza 404 si no existe
        return ResponseEntity.noContent().build(); // 204 No Content (respuesta vacía)
    }
}

