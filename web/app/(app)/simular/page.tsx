"use client";

import { useState } from "react";
import { simular, SimulacionInput, ResultadoSimulacion } from "@/lib/motor";
import { supabase } from "@/lib/supabase/client";
import { guardarSimulacionYActivar } from "@/lib/guardarPrestamo";
import { guardarSimulacionPendiente } from "@/lib/simulacionPendiente";
import FormularioSimulacion from "@/components/FormularioSimulacion";
import ResultadoSimulacionView from "@/components/ResultadoSimulacion";

export default function SimularPage() {
  const [input, setInput] = useState<SimulacionInput | null>(null);
  const [resultado, setResultado] = useState<ResultadoSimulacion | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSimular(nuevoInput: SimulacionInput) {
    setInput(nuevoInput);
    setResultado(simular(nuevoInput));
    setError(null);
  }

  async function handleIniciarSeguimiento() {
    if (!input || !resultado) return;
    setError(null);
    setGuardando(true);

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      guardarSimulacionPendiente(input, resultado);
      window.location.href = "/login?next=/dashboard";
      return;
    }

    try {
      await guardarSimulacionYActivar(input, resultado, session.user.id);
      window.location.href = "/dashboard";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ocurrió un error al guardar tu préstamo.");
      setGuardando(false);
    }
  }

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto">
      <div className="text-left border-b border-slate-200 pb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-navy uppercase tracking-tight">Simulador de Préstamos</h1>
        <p className="text-slate-600 font-medium mt-2">Complete el formulario para conocer la TCEA y el cronograma exacto de pagos.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 w-full items-start">
        {/* Formulario: Ocupa 5 columnas de 12 en pantallas grandes */}
        <div className="xl:col-span-5 w-full">
          <FormularioSimulacion onSimular={handleSimular} />
        </div>

        {/* Resultados: Ocupa 7 columnas de 12 en pantallas grandes */}
        <div className="xl:col-span-7 w-full">
          {resultado ? (
            <div className="flex flex-col gap-6 w-full">
              <ResultadoSimulacionView resultado={resultado} />

              {/* Tarjeta de CTA para guardar */}
              <div className="bg-navy text-white rounded-2xl p-6 md:p-8 shadow-xl border border-navy/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal/20 rounded-full blur-3xl -z-0" />
                <div className="relative z-10 text-center">
                  <h3 className="text-xl font-bold mb-2">¿Desea guardar este préstamo?</h3>
                  <p className="text-slate-300 mb-6 text-sm">Haga seguimiento a sus cuotas y reciba recordatorios de pago.</p>
                  <button
                    onClick={handleIniciarSeguimiento}
                    disabled={guardando}
                    className="bg-teal text-white font-bold px-8 py-4 rounded-xl hover:bg-teal/90 transition disabled:opacity-50 w-full sm:w-auto text-lg shadow-lg shadow-teal/30"
                  >
                    {guardando ? "Guardando..." : "Iniciar seguimiento"}
                  </button>
                  {error && <p className="text-sm text-red-300 mt-3 font-medium">{error}</p>}
                  <p className="text-xs text-slate-400 mt-4">Si no tiene una cuenta, le pediremos crear una gratis.</p>
                </div>
              </div>
            </div>
          ) : (
            /* Estado vacío profesional */
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center flex flex-col items-center justify-center h-full min-h-[500px]">
              <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-navy mb-3">Esperando datos...</h3>
              <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                Ingrese los datos de su préstamo en el formulario de la izquierda y presione <strong className="text-navy">"Calcular Préstamo"</strong> para visualizar el cronograma de pagos y la TCEA aquí.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}