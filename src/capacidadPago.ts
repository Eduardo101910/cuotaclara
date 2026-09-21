import { CapacidadPago } from "./tipos";

/** Umbral recomendado: la cuota no debería superar este % del ingreso mensual. */
const UMBRAL_RECOMENDADO = 0.3; // 30%

/**
 * Calcula qué porcentaje del ingreso mensual representa la cuota, y si supera
 * el umbral recomendado (30% es el criterio conservador más usado; algunos
 * bancos aceptan hasta 35-40%, pero eso ya es zona de riesgo).
 *
 * FUNCIÓN OPCIONAL: solo se debe llamar si el usuario marcó la casilla
 * "calcular mi capacidad de pago" y proporcionó su ingreso mensual.
 */
export function calcularCapacidadPago(cuotaMensual: number, ingresoMensual: number): CapacidadPago {
  const porcentajeSobreIngreso = cuotaMensual / ingresoMensual;

  return {
    cuotaMensual,
    ingresoMensual,
    porcentajeSobreIngreso: Math.round(porcentajeSobreIngreso * 10000) / 10000,
    alerta: porcentajeSobreIngreso > UMBRAL_RECOMENDADO,
  };
}
