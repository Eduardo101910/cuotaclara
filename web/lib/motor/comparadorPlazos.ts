import { SimulacionInput } from "./tipos";
import { simular } from "./motor";

export interface FilaComparadorPlazo {
  plazoMeses: number;
  cuotaMensual: number;
  totalPagado: number;
  totalIntereses: number;
  tcea: number;
}

/**
 * Corre la simulación con varios plazos distintos (ej. [12, 24, 36]) manteniendo
 * el resto de parámetros iguales, y devuelve una tabla comparativa.
 *
 * FUNCIÓN OPCIONAL: solo se debe llamar si el usuario marca la casilla
 * "comparar distintos plazos" en el formulario. Si no la marca, el flujo
 * normal de simular() con un solo plazo no se ve afectado en absoluto.
 */
export function compararPlazos(
  inputBase: Omit<SimulacionInput, "plazoMeses">,
  plazosMeses: number[]
): FilaComparadorPlazo[] {
  return plazosMeses.map((plazoMeses) => {
    const resultado = simular({ ...inputBase, plazoMeses });
    return {
      plazoMeses,
      cuotaMensual: resultado.cuotaBaseFrances,
      totalPagado: resultado.totalPagado,
      totalIntereses: resultado.totalIntereses,
      tcea: resultado.tcea,
    };
  });
}
