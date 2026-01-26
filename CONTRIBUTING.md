# Contributing

Gracias por contribuir al proyecto ORGMedi. Este documento resume las reglas básicas para aportar código, crear PRs y mantener calidad.

Ramas y flujo de trabajo
- `main`/`master`: rama estable y desplegada. Los PRs se mergean a través de Pull Requests.
- Crear ramas de feature: `feature/descripcion-corta`.
- Crear ramas de fix: `fix/descripcion-corta`.

Commits
- Usar mensajes concisos y en inglés/español según convención del equipo. Formato sugerido:
  - `feat(...)` para nuevas funcionalidades
  - `fix(...)` para correcciones
  - `chore(...)` para tareas de mantenimiento

Pull Requests
- Incluir descripción del cambio, issue relacionado (si hay) y pasos para validar localmente.
- Ejecutar tests localmente y adjuntar resultados si aplicable.

Code style
- Prettier y ESLint se usan en el proyecto. Ejecutar formateo antes de push.

Tests
- Añadir tests para cambios en lógica (unit/integration).
- Mantener coverage y no reducir el porcentaje global sin justificación.

Revisión
- Al menos una revisión aprobada requerida antes de merge.
- Correr CI y arreglar fallos reportados por el pipeline.

Gracias por tu aporte.
