import { SimulacionInput, ResultadoSimulacion } from "./tipos";
import { teaATem } from "./tasas";
import { generarCronogramaFrances, redondear } from "./cronograma";
import { calcularTCEA } from "./tcea";
import { calcularCapacidadPago } from "./capacidadPago";

/**
 * Función principal del motor de cálculo. Recibe los datos del formulario
 * de simulación y devuelve todo lo que la pantalla de resultados necesita
 * mostrar: cuota, cronograma completo, totales y TCEA.
 */
export function simular(input: SimulacionInput): ResultadoSimulacion {
  const tem = teaATem(input.tea);

  const cronograma = generarCronogramaFrances({
    monto: input.monto,
    plazoMeses: input.plazoMeses,
    tem,
    comisionMensual: input.comisionMensual,
    seguroDesgravamenPorc: input.seguroDesgravamenPorc,
    portesMensual: input.portesMensual,
    fechaInicio: input.fechaInicio,
  });

  const totalIntereses = cronograma.reduce((acc, c) => acc + c.interes, 0);
  const totalComisiones = cronograma.reduce((acc, c) => acc + c.comision, 0);
  const totalSeguros = cronograma.reduce((acc, c) => acc + c.seguroDesgravamen, 0);
  const totalPortes = cronograma.reduce((acc, c) => acc + c.portes, 0);
  const totalPagado = cronograma.reduce((acc, c) => acc + c.cuotaTotal, 0);

  // La comisión de desembolso es OPCIONAL: si el usuario no la marca, input.comisionDesembolso
  // llega como undefined y el monto neto desembolsado es igual al monto solicitado (no cambia nada).
  const comisionDesembolso = input.comisionDesembolso ?? 0;
  const montoNetoDesembolsado = input.monto - comisionDesembolso;
  const tcea = calcularTCEA(montoNetoDesembolsado, cronograma);

  const resultado: ResultadoSimulacion = {
    cuotaBaseFrances: redondear(cronograma[0]?.cuotaTotal ?? 0),
    cronograma,
    totalIntereses: redondear(totalIntereses),
    totalComisiones: redondear(totalComisiones),
    totalSeguros: redondear(totalSeguros),
    totalPortes: redondear(totalPortes),
    totalPagado: redondear(totalPagado),
    tem: redondear(tem * 10000) / 10000,
    tcea: redondear(tcea * 10000) / 10000,
  };

  // La capacidad de pago es OPCIONAL: solo se calcula si el usuario marcó la casilla
  // y por lo tanto proporcionó `ingresoMensual`. Si no, el campo simplemente no existe.
  if (input.ingresoMensual !== undefined && input.ingresoMensual > 0) {
    resultado.capacidadPago = calcularCapacidadPago(resultado.cuotaBaseFrances, input.ingresoMensual);
  }

  return resultado;
}
