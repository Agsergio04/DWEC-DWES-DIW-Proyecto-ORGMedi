/**
 * EJEMPLO 1: Opciones de frecuencia para medicamentos
 * Valores en horas entre dosis
 */
export const FREQUENCY_OPTIONS: SelectorOption[] = [
  { id: 1, label: 'Cada 1 hora' },
  { id: 2, label: 'Cada 2 horas' },
  { id: 3, label: 'Cada 3 horas' },
  { id: 4, label: 'Cada 4 horas' },
  { id: 6, label: 'Cada 6 horas' },
  { id: 12, label: 'Cada 12 horas' }
];

/**
 * EJEMPLO 2: Opciones de color para medicamentos
 * Utiliza las variables de color definidas en: frontend/src/styles/00-settings/_variables.scss
 */
export const COLOR_OPTIONS: SelectorOption[] = [
  { id: 'variante-primera', label: 'Azul Cian', color: 'var(--color-variante-primera)' },
  { id: 'variante-segunda', label: 'Amarillo', color: 'var(--color-variante-segunda)' },
  { id: 'variante-tercera', label: 'Rosa Magenta', color: 'var(--color-variante-tercera)' },
  { id: 'variante-cuarta', label: 'Naranja', color: 'var(--color-variante-cuarta)' },
  { id: 'variante-quinta', label: 'Magenta', color: 'var(--color-variante-quinta)' }
];
