import { CuotaCronograma } from "./tipos";
import { calcularCuotaFrances } from "./cronograma";

export type ModalidadPagoAnticipado = "reducir_cuota" | "reducir_plazo";

export interface ResultadoPagoAnticipado {
  modalidad: ModalidadPagoAnticipado;
  saldoAntesDelAbono: number;
  montoAbonado: number;
  saldoDespuesDelAbono: number;
  /** Si modalidad = "reducir_cuota": la nueva cuota mensual (mismo plazo restante) */
  nuevaCuota?: number;
  /** Si modalidad = "reducir_plazo": el nuevo número de cuotas restantes (misma cuota) */
  nuevoPlazoRestante?: number;
  ahorroEnIntereses: number;
}

/**
 * Calcula el efecto de un pago anticipado (amortización extraordinaria) sobre
 * un préstamo ya en curso, en el mes `numeroCuotaDondeAbona`.
 *
 * FUNCIÓN OPCIONAL: solo se debe llamar si el usuario marca la casilla
 * "simular pago anticipado" sobre un préstamo activo. No afecta el flujo
 * normal de simulación ni de cronograma.
 *
 * @param cronogramaOriginal El cronograma ya generado por generarCronogramaFrances
 * @param numeroCuotaDondeAbona En qué cuota se hace el abono extra (1-indexed)
 * @param montoAbonado Cuánto abona el usuario, además de la cuota normal de ese mes
 * @param tem La misma TEM usada para generar el cronograma original
 * @param modalidad "reducir_cuota" (misma cantidad de meses, cuota más baja) o
 *                  "reducir_plazo" (misma cuota, menos meses)
 */
export function calcularPagoAnticipado(
  cronogramaOriginal: CuotaCronograma[],
  numeroCuotaDondeAbona: number,
  montoAbonado: number,
  tem: number,
  modalidad: ModalidadPagoAnticipado
): ResultadoPagoAnticipado {
  const cuotaAnterior = cronogramaOriginal.find((c) => c.numeroCuota === numeroCuotaDondeAbona);
  if (!cuotaAnterior) {
    throw new Error(`No existe la cuota número ${numeroCuotaDondeAbona} en este cronograma.`);
  }

  const saldoAntesDelAbono = cuotaAnterior.saldoFinal;
  const saldoDespuesDelAbono = Math.max(saldoAntesDelAbono - montoAbonado, 0);
  const plazoRestanteOriginal = cronogramaOriginal.length - numeroCuotaDondeAbona;

  // Interés total que faltaba pagar en el escenario ORIGINAL (sin abono),
  // para poder calcular cuánto se ahorra con el abono.
  const interesFaltanteOriginal = cronogramaOriginal
    .filter((c) => c.numeroCuota > numeroCuotaDondeAbona)
    .reduce((acc, c) => acc + c.interes, 0);

  const resultado: ResultadoPagoAnticipado = {
    modalidad,
    saldoAntesDelAbono,
    montoAbonado,
    saldoDespuesDelAbono,
    ahorroEnIntereses: 0, // se completa más abajo
  };

  // Caso borde: el abono cancela toda la deuda restante. No hay nueva cuota
  // ni nuevo plazo que calcular — se ahorra el 100% del interés que faltaba.
  if (saldoDespuesDelAbono <= 0) {
    resultado.ahorroEnIntereses = Math.round(interesFaltanteOriginal * 100) / 100;
    if (modalidad === "reducir_cuota") {
      resultado.nuevaCuota = 0;
    } else {
      resultado.nuevoPlazoRestante = 0;
    }
    return resultado;
  }

  if (modalidad === "reducir_cuota") {
    // Mismo número de cuotas restantes, cuota nueva más baja.
    const nuevaCuota = calcularCuotaFrances(saldoDespuesDelAbono, tem, plazoRestanteOriginal);
    resultado.nuevaCuota = Math.round(nuevaCuota * 100) / 100;

    const interesFaltanteNuevo = calcularInteresTotalRestante(saldoDespuesDelAbono, tem, plazoRestanteOriginal);
    resultado.ahorroEnIntereses = Math.round((interesFaltanteOriginal - interesFaltanteNuevo) * 100) / 100;
  } else {
    // Misma cuota, se recalcula cuántas cuotas hacen falta para llegar a 0.
    const cuotaFija = cuotaAnterior.cuotaTotal - cuotaAnterior.seguroDesgravamen - cuotaAnterior.comision - cuotaAnterior.portes;
    const nuevoPlazoRestante = calcularNumeroCuotasNecesarias(saldoDespuesDelAbono, tem, cuotaFija);
    resultado.nuevoPlazoRestante = nuevoPlazoRestante;

    const interesFaltanteNuevo = calcularInteresTotalRestante(saldoDespuesDelAbono, tem, nuevoPlazoRestante);
    resultado.ahorroEnIntereses = Math.round((interesFaltanteOriginal - interesFaltanteNuevo) * 100) / 100;
  }

  return resultado;
}

/** Suma el interés total que se pagaría en `n` cuotas futuras sobre un saldo dado. */
function calcularInteresTotalRestante(saldo: number, tem: number, n: number): number {
  if (n <= 0) return 0;
  const cuota = calcularCuotaFrances(saldo, tem, n);
  let saldoRestante = saldo;
  let interesTotal = 0;
  for (let i = 0; i < n; i++) {
    const interes = saldoRestante * tem;
    interesTotal += interes;
    saldoRestante -= cuota - interes;
  }
  return interesTotal;
}

/** Dado un saldo, una tasa y una cuota fija, calcula cuántas cuotas hacen falta para llegar a 0. */
function calcularNumeroCuotasNecesarias(saldo: number, tem: number, cuotaFija: number): number {
  // n = -log(1 - saldo*tem/cuota) / log(1+tem)
  const n = -Math.log(1 - (saldo * tem) / cuotaFija) / Math.log(1 + tem);
  return Math.ceil(n);
}
