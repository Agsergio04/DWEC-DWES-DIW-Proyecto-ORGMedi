-- Script de datos iniciales para H2
-- Las tablas se crean automáticamente por Hibernate via JPA
-- Usuario de prueba para testing

-- Contraseña: password123 (hasheada con BCrypt)
INSERT INTO usuarios (correo, usuario, contrasena) VALUES ('test@example.com', 'testuser', '$2a$10$slYQmyNdGzin7olVN3p5Be7DQH.RcPMvJ/Z8PoZfqf8JqYKVl2O8a');

-- Gestor de medicamentos para el usuario de prueba
INSERT INTO gestor_medicamentos (usuario_id) VALUES (1);
