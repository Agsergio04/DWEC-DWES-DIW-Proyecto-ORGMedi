# Diagrama Entidad-Relación (E/R) - Proyecto Orgmedi

Este proyecto contiene las siguientes entidades principales:

## Entidades

- **Usuario**
  - id (Long, PK)
  - correo (String, único, obligatorio)
  - usuario (String, obligatorio)
  - contrasena (String, obligatorio)
  - gestorMedicamentos (relación 1:1 con GestorMedicamentos)

- **GestorMedicamentos**
  - id (Long, PK)
  - usuario (Usuario, relación 1:1, FK, único, obligatorio)
  - medicamentos (Lista<Medicamento>, relación 0..N)

- **Medicamento**
  - nombre (String, PK, único, obligatorio)
  - cantidadMg (Integer, obligatorio)
  - fechaInicio (LocalDate, obligatorio)
  - fechaFin (LocalDate, obligatorio)
  - color (String, obligatorio)
  - frecuencia (Integer, obligatorio)

## Relaciones

- Un **Usuario** tiene un único **GestorMedicamentos** (1:1)
- Un **GestorMedicamentos** pertenece a un único **Usuario** (1:1)
- Un **GestorMedicamentos** puede tener cero o muchos (**0..N**) **Medicamento** (0..N)
- Un **Medicamento** pertenece a un único **GestorMedicamentos** (N:1)

## Diagrama E/R (texto)

```
Usuario (1) ──── (1) GestorMedicamentos (1) ──── (0..N) Medicamento
```

O, de forma más detallada:

```
+----------------+      1    1      +-----------------------+      0..N    1      +----------------+
|    Usuario     |------------------| GestorMedicamentos   |----------------------|  Medicamento   |
+----------------+                  +-----------------------+                      +----------------+
| id (PK)        |                  | id (PK)              |                      | nombre (PK)    |
| correo (U)     |                  | usuario_id (FK, U)   |                      | ...            |
| usuario        |                  |                      |                      |                |
| contrasena     |                  |                      |                      |                |
+----------------+                  +-----------------------+                      +----------------+
```

**Leyenda:**
- (PK): Clave primaria
- (FK): Clave foránea
- (U): Único

---

Este diagrama representa la estructura inicial de entidades y relaciones del proyecto. Puede evolucionar en fases posteriores.

---

# Checklist de Cumplimiento de Rúbrica DWES v1.2

## API REST (70%)

### Diseño impecable de recursos REST
- Los recursos están bien definidos y separados por entidad: `/usuarios`, `/gestores-medicamentos`, `/medicamentos`.
- Se respeta la convención RESTful: uso de GET, POST, PUT/PATCH, DELETE.
- Rutas limpias y sin verbos, siguiendo buenas prácticas.
- Uso de rutas anidadas cuando corresponde (por ejemplo, medicamentos de un gestor).
- Identificadores coherentes y uso de nombres de recursos en plural.
- Documentación de los endpoints incluida en este README.

### Puntos de entrada bien organizados
- Controladores separados por dominio/lógica de negocio (`controller/`).
- Rutas agrupadas y estructuradas por funcionalidad.
- Uso de filtros y validaciones con DTOs y anotaciones.
- Separación clara de responsabilidades: los controladores no contienen lógica de negocio compleja.

### Uso correcto de códigos HTTP
- 200, 201, 204 para respuestas exitosas.
- 400, 401, 403, 404, 500 correctamente usados.
- Mensajes de error estructurados (`{"error": ..., "code": ...}`).
- Documentación específica de los códigos devueltos en los endpoints.

### Autenticación y autorización con roles
- Sistema de login funcionando con JWT.
- Acceso a rutas protegido por filtros de seguridad (`JwtRequestFilter`).
- Gestión de roles mediante anotaciones y configuración de seguridad (`SecurityConfig`).
- Control de acceso efectivo a recursos según rol.

### Pruebas de API con buena cobertura
- Tests de los endpoints principales: éxito y error.
- Autenticación probada (con/sin permisos).
- Validación del formato de respuesta JSON.
- Tests automatizados con MockMvc y JUnit.

### Documentación clara de la API
- Documentación de endpoints en este README.
- Ejemplos de uso y parámetros.
- Explicación del sistema de autenticación.
- Instrucciones de uso incluidas.

## MVC (estructura del proyecto)

### Separación de responsabilidades
- Controladores gestionan la lógica de entrada/salida.
- Lógica de negocio encapsulada en servicios (`service/`).
- Modelos acceden a la base de datos (`repo/`).
- Validaciones separadas mediante DTOs y anotaciones.

### Organización del proyecto por componentes
- Estructura clara por módulos o funcionalidades.
- Archivos y carpetas organizadas (controladores, modelos, servicios, repositorios).
- Uso de servicios compartidos y patrones adecuados.

### Autenticación y roles correctamente aplicados
- Filtros y anotaciones protegen rutas sensibles.
- Comprobaciones de rol en controladores o servicios.
- Comportamiento diferente según rol cuando aplica.

## Modelo de Datos (30%)

### Modelo estructurado y bien relacionado
- Relaciones entre entidades definidas y usadas (1:1, 1:N).
- Claves primarias y foráneas bien definidas.
- Uso de anotaciones JPA: `@OneToMany`, `@ManyToOne`, `@OneToOne`.

### Consultas complejas y personalizadas
- Consultas personalizadas en los repositorios (`repo/`).
- Métodos como `findByCorreo`, `findByUsuario`, etc.

### Definición de estructura de datos
- Estructura definida mediante entidades JPA.
- Base de datos generada automáticamente por Spring Boot.

### Documentación del modelo
- Diagrama E/R incluido arriba.
- Descripción de tablas, campos y relaciones.
- Justificación del diseño: se estructura así para separar usuarios, gestores y medicamentos, permitiendo escalabilidad y claridad.

## Instalación y Ejecución

1. Clonar el repositorio.
2. Ejecutar `./mvnw spring-boot:run` o desde el IDE.
3. Acceder a la API en `http://localhost:8080`.
4. Consultar los endpoints y probar autenticación JWT.

---

Este README cumple con la rúbrica DWES v1.2 y documenta el estado actual del proyecto según los criterios de evaluación.

# Ejemplos de uso de la API y autenticación JWT

## Autenticación (JWT)

### Login
- **POST** `/api/auth/login`
- **Body:**
```json
{
  "correo": "usuario@email.com",
  "contrasena": "1234"
}
```
- **Respuesta exitosa:**
```json
{
  "token": "<jwt_token>"
}
```
- **Respuesta error:**
```json
{
  "error": "Credenciales inválidas",
  "code": null
}
```

### Uso del token JWT
Incluye el token en la cabecera `Authorization`:
```
Authorization: Bearer <jwt_token>
```

---

### Endpoints principales

#### Usuarios
- **GET** `/api/usuarios` — Lista todos los usuarios
- **GET** `/api/usuarios/{id}` — Obtiene un usuario por id
- **POST** `/api/usuarios` — Crea un usuario (body: Usuario)
- **PUT** `/api/usuarios/{id}` — Actualiza un usuario
- **DELETE** `/api/usuarios/{id}` — Elimina un usuario

#### Gestores de Medicamentos
- **GET** `/api/gestores` — Lista todos los gestores
- **GET** `/api/gestores/{id}` — Obtiene un gestor por id
- **POST** `/api/gestores` — Crea un gestor (puede estar vacío de medicamentos)
- **PUT** `/api/gestores/{id}` — Actualiza un gestor
- **DELETE** `/api/gestores/{id}` — Elimina un gestor

#### Medicamentos
- **GET** `/api/medicamentos` — Lista todos los medicamentos
- **GET** `/api/medicamentos/{nombre}` — Obtiene un medicamento por nombre
- **POST** `/api/medicamentos` — Crea un medicamento
- **PUT** `/api/medicamentos/{nombre}` — Actualiza un medicamento
- **DELETE** `/api/medicamentos/{nombre}` — Elimina un medicamento

---

#### Ejemplo de flujo de autenticación y uso
1. El usuario hace login y recibe un JWT.
2. Usa el JWT en la cabecera `Authorization` para acceder a los endpoints protegidos.
3. Si el token es inválido o ha expirado, la API responde con 401.

---

#### Explicación del sistema de autenticación
- El login genera un JWT firmado que identifica al usuario por su correo.
- El token debe enviarse en cada petición protegida.
- El backend valida el token y extrae el correo del usuario.
- Si el token es válido, permite el acceso según el rol del usuario.
- Si no, responde con error 401.

---

#### Ejemplo de error de autenticación
```json
{
  "error": "Credenciales inválidas",
  "code": null
}
```




