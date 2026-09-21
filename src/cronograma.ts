import { CuotaCronograma } from "./tipos";

/**
 * Calcula la cuota fija del sistema francés (sin cargos adicionales).
 * Fórmula: Cuota = P * i / (1 - (1 + i) ^ -n)
 *
 * @param monto Monto del préstamo (P)
 * @param tem Tasa Efectiva Mensual (i)
 * @param plazoMeses Número de cuotas (n)
 */
export function calcularCuotaFrances(monto: number, tem: number, plazoMeses: number): number {
  if (tem === 0) return monto / plazoMeses; // caso borde: tasa 0%
  const factor = 1 - Math.pow(1 + tem, -plazoMeses);
  return (monto * tem) / factor;
}

/**
 * Suma un número de meses a una fecha, preservando el día cuando es posible.
 */
function sumarMeses(fecha: Date, meses: number): Date {
  const resultado = new Date(fecha);
  resultado.setMonth(resultado.getMonth() + meses);
  return resultado;
}

/**
 * Genera el cronograma de pagos completo (tabla de amortización) bajo el
 * sistema francés, incluyendo cargos adicionales por cuota (comisión, seguro
 * de desgravamen sobre saldo, portes).
 */
export function generarCronogramaFrances(params: {
  monto: number;
  plazoMeses: number;
  tem: number;
  comisionMensual: number;
  seguroDesgravamenPorc: number;
  portesMensual: number;
  fechaInicio?: Date;
}): CuotaCronograma[] {
  const { monto, plazoMeses, tem, comisionMensual, seguroDesgravamenPorc, portesMensual, fechaInicio } = params;

  const cuotaBase = calcularCuotaFrances(monto, tem, plazoMeses);
  const cronograma: CuotaCronograma[] = [];

  let saldo = monto;

  for (let n = 1; n <= plazoMeses; n++) {
    const interes = saldo * tem;
    let amortizacion = cuotaBase - interes;

    // Ajuste en la última cuota para que el saldo cierre exactamente en 0
    // (evita arrastrar centavos por redondeo acumulado).
    if (n === plazoMeses) {
      amortizacion = saldo;
    }

    const seguroDesgravamen = saldo * seguroDesgravamenPorc;
    const saldoFinal = saldo - amortizacion;
    const cuotaTotal = (n === plazoMeses ? amortizacion + interes : cuotaBase) + seguroDesgravamen + comisionMensual + portesMensual;

    cronograma.push({
      numeroCuota: n,
      fechaPago: fechaInicio ? sumarMeses(fechaInicio, n) : null,
      saldoInicial: redondear(saldo),
      interes: redondear(interes),
      amortizacion: redondear(amortizacion),
      seguroDesgravamen: redondear(seguroDesgravamen),
      comision: redondear(comisionMensual),
      portes: redondear(portesMensual),
      cuotaTotal: redondear(cuotaTotal),
      saldoFinal: redondear(Math.max(saldoFinal, 0)),
    });

    saldo = saldoFinal;
  }

  return cronograma;
}

/** Redondeo estándar a 2 decimales para valores monetarios. */
export function redondear(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}
