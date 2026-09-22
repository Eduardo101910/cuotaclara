import { SimulacionInput, ResultadoSimulacion } from "./motor";

const CLAVE = "cuotaclara_simulacion_pendiente";

export interface SimulacionPendiente {
  input: SimulacionInput;
  resultado: ResultadoSimulacion;
}

export function guardarSimulacionPendiente(input: SimulacionInput, resultado: ResultadoSimulacion) {
  localStorage.setItem(CLAVE, JSON.stringify({ input, resultado }));
}

export function leerSimulacionPendiente(): SimulacionPendiente | null {
  const raw = localStorage.getItem(CLAVE);
  if (!raw) return null;

  const pendiente = JSON.parse(raw) as SimulacionPendiente;

  if (pendiente.input.fechaInicio) {
    pendiente.input.fechaInicio = new Date(pendiente.input.fechaInicio);
  }
  pendiente.resultado.cronograma.forEach((c) => {
    if (c.fechaPago) c.fechaPago = new Date(c.fechaPago as unknown as string);
  });

  return pendiente;
}

export function borrarSimulacionPendiente() {
  localStorage.removeItem(CLAVE);
}