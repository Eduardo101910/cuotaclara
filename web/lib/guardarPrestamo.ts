import { supabase } from "./supabase/client";
import { SimulacionInput, ResultadoSimulacion } from "./motor";

export async function guardarSimulacionYActivar(
  input: SimulacionInput,
  resultado: ResultadoSimulacion,
  userId: string
): Promise<{ loanActiveId: string }> {
  const { data: simulacion, error: errorSimulacion } = await supabase
    .from("loan_simulations")
    .insert({
      user_id: userId,
      monto: input.monto,
      plazo_meses: input.plazoMeses,
      tea: input.tea,
      sistema: "frances",
      comision_mensual: input.comisionMensual,
      seguro_desgravamen_porc: input.seguroDesgravamenPorc,
      portes_mensual: input.portesMensual,
      comision_desembolso: input.comisionDesembolso ?? null,
      ingreso_mensual: input.ingresoMensual ?? null,
      tem_calculada: resultado.tem,
      tcea_calculada: resultado.tcea,
    })
    .select("id")
    .single();

  if (errorSimulacion || !simulacion) {
    throw new Error(`No se pudo guardar la simulación: ${errorSimulacion?.message}`);
  }

  const fechaInicio = input.fechaInicio ?? new Date();
  const { data: prestamoActivo, error: errorActivo } = await supabase
    .from("loan_active")
    .insert({
      simulation_id: simulacion.id,
      fecha_inicio: fechaInicio.toISOString().slice(0, 10),
      estado: "activo",
    })
    .select("id")
    .single();

  if (errorActivo || !prestamoActivo) {
    throw new Error(`No se pudo activar el préstamo: ${errorActivo?.message}`);
  }

  const filasCronograma = resultado.cronograma.map((c) => ({
    loan_active_id: prestamoActivo.id,
    numero_cuota: c.numeroCuota,
    fecha_pago: c.fechaPago ? c.fechaPago.toISOString().slice(0, 10) : fechaInicio.toISOString().slice(0, 10),
    monto_cuota: c.cuotaTotal,
    interes: c.interes,
    amortizacion: c.amortizacion,
    seguro: c.seguroDesgravamen,
    comision: c.comision,
    saldo: c.saldoFinal,
    pagado: false,
  }));

  const { error: errorPagos } = await supabase.from("payments").insert(filasCronograma);

  if (errorPagos) {
    throw new Error(`No se pudo guardar el cronograma: ${errorPagos.message}`);
  }

  return { loanActiveId: prestamoActivo.id };
}