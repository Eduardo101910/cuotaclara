import { CuotaCronograma } from "./tipos";
import { temATea } from "./tasas";

/**
 * Calcula el Valor Actual Neto de un flujo de caja para una tasa periódica dada.
 * flujo[0] es el desembolso (negativo desde la óptica del banco / positivo desde
 * la óptica del cliente: aquí trabajamos con el monto neto recibido por el
 * cliente como flujo positivo en t=0, y las cuotas como flujos negativos).
 */
function van(tasaPeriodica: number, flujos: number[]): number {
  return flujos.reduce((acc, flujo, t) => acc + flujo / Math.pow(1 + tasaPeriodica, t), 0);
}

/**
 * Encuentra la tasa periódica que hace VAN = 0 (tasa interna de retorno)
 * mediante bisección. Robusto y suficientemente preciso para uso financiero
 * (tolerancia de 1e-8), sin depender de derivadas.
 */
function irrPorBiseccion(flujos: number[], opciones?: { min?: number; max?: number; tolerancia?: number; maxIteraciones?: number }): number {
  let min = opciones?.min ?? -0.9; // -90% para evitar división por 0 o negativos absurdos
  let max = opciones?.max ?? 5; // 500% mensual como techo razonable
  const tolerancia = opciones?.tolerancia ?? 1e-8;
  const maxIteraciones = opciones?.maxIteraciones ?? 200;

  let vanMin = van(min, flujos);
  let vanMax = van(max, flujos);

  if (vanMin * vanMax > 0) {
    throw new Error("No se encontró un cambio de signo en el rango dado; revisa los flujos de caja.");
  }

  let medio = 0;
  for (let i = 0; i < maxIteraciones; i++) {
    medio = (min + max) / 2;
    const vanMedio = van(medio, flujos);

    if (Math.abs(vanMedio) < tolerancia) break;

    if (vanMin * vanMedio < 0) {
      max = medio;
      vanMax = vanMedio;
    } else {
      min = medio;
      vanMin = vanMedio;
    }
  }

  return medio;
}

/**
 * Calcula la TCEA (Tasa de Costo Efectivo Anual) a partir del monto neto
 * desembolsado al cliente y el cronograma completo de cuotas (que ya incluye
 * interés + comisión + seguro + portes en cada cuota).
 *
 * La TCEA responde: "¿qué tasa efectiva anual estoy realmente pagando,
 * considerando TODOS los cargos, no solo el interés?"
 *
 * @param montoDesembolsado Monto que el cliente recibe realmente en la mano
 *   (monto solicitado menos cualquier cargo inicial descontado por adelantado;
 *   si no hay cargos iniciales, es igual al monto solicitado).
 * @param cronograma Cronograma generado por generarCronogramaFrances.
 */
export function calcularTCEA(montoDesembolsado: number, cronograma: CuotaCronograma[]): number {
  const flujos = [montoDesembolsado, ...cronograma.map((c) => -c.cuotaTotal)];
  const temImplicita = irrPorBiseccion(flujos);
  return temATea(temImplicita);
}
