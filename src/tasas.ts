/**
 * Conversión de tasas de interés.
 * Todas las tasas se manejan como decimales (45% => 0.45), nunca como enteros.
 */

/**
 * Convierte una Tasa Efectiva Anual (TEA) a Tasa Efectiva Mensual (TEM).
 * Fórmula: TEM = (1 + TEA) ^ (1/12) - 1
 */
export function teaATem(tea: number): number {
  return Math.pow(1 + tea, 1 / 12) - 1;
}

/**
 * Convierte una Tasa Efectiva Mensual (TEM) de vuelta a Tasa Efectiva Anual (TEA).
 * Fórmula: TEA = (1 + TEM) ^ 12 - 1
 * Se usa para anualizar la TCEA una vez calculada en base mensual.
 */
export function temATea(tem: number): number {
  return Math.pow(1 + tem, 12) - 1;
}

/**
 * Convierte una Tasa Nominal Anual (TNA) a Tasa Efectiva Mensual (TEM),
 * dado el número de capitalizaciones por año (m).
 * Fórmula: TEM = (1 + TNA/m) ^ (m/12) - 1
 *
 * Ejemplo: TNA = 40% capitalizable diariamente (m=360) => teaATem no aplica,
 * se debe usar esta función con m=360.
 */
export function tnaATem(tna: number, capitalizacionesPorAnio: number): number {
  return Math.pow(1 + tna / capitalizacionesPorAnio, capitalizacionesPorAnio / 12) - 1;
}
