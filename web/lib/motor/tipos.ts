/**
 * Tipos del motor de cálculo de CuotaClara.
 * Alcance V1: solo préstamos personales, sistema de amortización francés.
 */

export interface SimulacionInput {
  /** Monto solicitado (S/) */
  monto: number;
  /** Plazo del préstamo en meses */
  plazoMeses: number;
  /** Tasa Efectiva Anual, como decimal. Ej: 45% => 0.45 */
  tea: number;
  /** Comisión de administración mensual fija (S/). 0 si no aplica. */
  comisionMensual: number;
  /** Seguro de desgravamen mensual, como % sobre saldo (decimal). Ej: 0.05% => 0.0005 */
  seguroDesgravamenPorc: number;
  /** Portes u otros cargos fijos mensuales (S/). 0 si no aplica. */
  portesMensual: number;
  /** Fecha de desembolso/inicio (opcional, para generar fechas reales en el cronograma) */
  fechaInicio?: Date;

  // --- Campos opcionales: solo se activan si el usuario marca la casilla correspondiente en el formulario ---

  /**
   * Comisión de desembolso (cargo único al inicio, ej. S/ 100).
   * OPCIONAL — solo incluirla si el usuario marca "¿Tiene comisión de desembolso?".
   * Si se omite (undefined), se asume 0 y no afecta el cálculo.
   */
  comisionDesembolso?: number;

  /**
   * Ingreso mensual del usuario (S/).
   * OPCIONAL — solo incluirla si el usuario marca "¿Quieres calcular tu capacidad de pago?".
   * Si se omite (undefined), el resultado simplemente no trae el bloque `capacidadPago`.
   */
  ingresoMensual?: number;
}

export interface CapacidadPago {
  cuotaMensual: number;
  ingresoMensual: number;
  /** Porcentaje que representa la cuota sobre el ingreso (0.30 = 30%) */
  porcentajeSobreIngreso: number;
  /** true si supera el umbral recomendado (30% por defecto) */
  alerta: boolean;
}

export interface CuotaCronograma {
  numeroCuota: number;
  fechaPago: Date | null;
  saldoInicial: number;
  interes: number;
  amortizacion: number;
  seguroDesgravamen: number;
  comision: number;
  portes: number;
  cuotaTotal: number;
  saldoFinal: number;
}

export interface ResultadoSimulacion {
  cuotaBaseFrances: number;
  cronograma: CuotaCronograma[];
  totalIntereses: number;
  totalComisiones: number;
  totalSeguros: number;
  totalPortes: number;
  totalPagado: number;
  tem: number;
  tcea: number;
  /**
   * Solo presente si el usuario proporcionó `ingresoMensual` en el input.
   * Si no la proporcionó, este campo es `undefined` — no se calcula nada de más.
   */
  capacidadPago?: CapacidadPago;
}
