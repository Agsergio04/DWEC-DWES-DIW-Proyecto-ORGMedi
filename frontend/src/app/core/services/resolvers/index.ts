/**
 * Barrel de Resolvers
 * 
 * Re-exporta todos los resolvers desde un punto central.
 * Facilita importar múltiples resolvers sin usar rutas largas.
 * 
 * Resolvers exportados:
 * - homeResolver: Carga datos iniciales de la página de inicio
 * - medicinesResolver: Carga lista de medicamentos antes de mostrar página
 * - profileResolver: Carga datos del perfil del usuario
 */

export * from './home.resolver';
export * from './medicines.resolver';
export * from './profile.resolver';
