-- Script de datos iniciales
-- Las tablas se crean automáticamente por Hibernate via JPA

-- Usuario Admin
-- Contraseña: admin123 (hasheada con BCrypt)
INSERT INTO usuarios (correo, usuario, contrasena) VALUES ('admin@orgmedi.com', 'admin', '$2a$10$xtF6xLxzHqLXVVDXMN4Z..EfKMxiLR/0BnqVNtBBvMK8KY8D2YsNi');

-- Gestor de medicamentos para el usuario admin
INSERT INTO gestor_medicamentos (usuario_id) VALUES (1);

-- Medicamento de ejemplo para la guía de estilos (admin)
-- Nombre: Paracetamol 500mg
-- Frecuencia: 6 horas
-- Inicio: 2026-01-15 a las 08:00
-- Fin: 2026-02-15
INSERT INTO medicamentos (nombre, cantidad_mg, fecha_inicio, hora_inicio, fecha_fin, color, frecuencia, consumed, gestor_medicamentos_id) 
VALUES ('Paracetamol', 500, '2026-01-15', '08:00', '2026-02-15', '#FF6B6B', 6, false, 1);

-- Medicamento adicional para la guía de estilos
-- Nombre: Ibuprofeno 400mg
-- Frecuencia: 8 horas
-- Inicio: 2026-01-20 a las 09:00
-- Fin: 2026-02-20
INSERT INTO medicamentos (nombre, cantidad_mg, fecha_inicio, hora_inicio, fecha_fin, color, frecuencia, consumed, gestor_medicamentos_id) 
VALUES ('Ibuprofeno', 400, '2026-01-20', '09:00', '2026-02-20', '#4ECDC4', 8, false, 1);
