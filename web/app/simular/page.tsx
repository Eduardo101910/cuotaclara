"use client";

import { useState } from "react";
import Link from "next/link";
import { simular, SimulacionInput, ResultadoSimulacion } from "@/lib/motor";
import { supabase } from "@/lib/supabase/client";
import { guardarSimulacionYActivar } from "../../lib/guardarPrestamo";
import { guardarSimulacionPendiente } from "../../lib/simulacionPendiente";
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

    const {
      data: { session },
    } = await supabase.auth.getSession();

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
    <main className="min-h-screen px-6 py-10 flex flex-col items-center gap-8">
      <div className="w-full max-w-3xl">
        <Link href="/" className="text-sm text-slate-500 hover:underline">
          ← Volver al inicio
        </Link>
        <h1 className="text-3xl font-bold text-navy mt-2">Simula tu préstamo</h1>
        <p className="text-slate-600">Completa los datos y descubre el costo real (TCEA) de tu préstamo.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 w-full items-start justify-center">
        <FormularioSimulacion onSimular={handleSimular} />

        {resultado && (
          <div className="flex flex-col gap-4 w-full max-w-3xl">
            <ResultadoSimulacionView resultado={resultado} />

            <div className="bg-navy text-white rounded-xl p-5 text-center">
              <p className="mb-3 font-medium">¿Quieres que te recordemos tus fechas de pago?</p>
              <button
                onClick={handleIniciarSeguimiento}
                disabled={guardando}
                className="bg-teal px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {guardando ? "Guardando..." : "Iniciar seguimiento de este préstamo"}
              </button>
              {error && <p className="text-sm text-red-300 mt-2">{error}</p>}
              <p className="text-xs text-slate-300 mt-2">Si no tienes cuenta, te pediremos crear una gratis.</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}