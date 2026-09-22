"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

interface PrestamoActivo {
  id: string;
  estado: string;
  fecha_inicio: string;
  loan_simulations: {
    monto: number;
    plazo_meses: number;
    tea: number;
    tcea_calculada: number;
  };
  proximaCuota: {
    numero_cuota: number;
    fecha_pago: string;
    monto_cuota: number;
  } | null;
}

const formatoSoles = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });
const formatoFecha = new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric" });

export default function DashboardPage() {
  const [cargando, setCargando] = useState(true);
  const [prestamos, setPrestamos] = useState<PrestamoActivo[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setCargando(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      window.location.href = "/login?next=/dashboard";
      return;
    }

    const { data: activos, error: errorActivos } = await supabase
      .from("loan_active")
      .select("id, estado, fecha_inicio, loan_simulations(monto, plazo_meses, tea, tcea_calculada)")
      .order("fecha_inicio", { ascending: false });

    if (errorActivos) {
      setError(errorActivos.message);
      setCargando(false);
      return;
    }

    const prestamosConProximaCuota: PrestamoActivo[] = await Promise.all(
      (activos ?? []).map(async (p: any) => {
        const { data: proxima } = await supabase
          .from("payments")
          .select("numero_cuota, fecha_pago, monto_cuota")
          .eq("loan_active_id", p.id)
          .eq("pagado", false)
          .order("numero_cuota", { ascending: true })
          .limit(1)
          .maybeSingle();

        return { ...p, proximaCuota: proxima ?? null };
      })
    );

    setPrestamos(prestamosConProximaCuota);
    setCargando(false);
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (cargando) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Cargando tus préstamos...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10 flex flex-col items-center gap-6">
      <div className="w-full max-w-3xl flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy">Mis préstamos</h1>
          <p className="text-slate-600 text-sm">Seguimiento de tus préstamos activos.</p>
        </div>
        <button onClick={cerrarSesion} className="text-sm text-slate-500 hover:underline">
          Cerrar sesión
        </button>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {prestamos.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center max-w-md">
          <p className="text-slate-600 mb-4">Todavía no tienes préstamos en seguimiento.</p>
          <Link href="/simular" className="bg-navy text-white font-semibold px-6 py-3 rounded-lg inline-block hover:opacity-90 transition">
            Simular un préstamo
          </Link>
        </div>
      ) : (
        <div className="w-full max-w-3xl flex flex-col gap-4">
          {prestamos.map((p) => (
            <div key={p.id} className="bg-white rounded-xl shadow p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold text-navy text-lg">{formatoSoles.format(p.loan_simulations.monto)}</p>
                  <p className="text-sm text-slate-500">
                    {p.loan_simulations.plazo_meses} meses · TEA {(p.loan_simulations.tea * 100).toFixed(1)}% · TCEA{" "}
                    {(p.loan_simulations.tcea_calculada * 100).toFixed(2)}%
                  </p>
                </div>
                <span className="text-xs bg-teal/10 text-teal font-semibold px-3 py-1 rounded-full capitalize">{p.estado}</span>
              </div>

              {p.proximaCuota ? (
                <div className="bg-slate-50 rounded-lg p-3 text-sm flex justify-between">
                  <span>
                    Próxima cuota (#{p.proximaCuota.numero_cuota}): <strong>{formatoFecha.format(new Date(p.proximaCuota.fecha_pago))}</strong>
                  </span>
                  <span className="font-semibold text-navy">{formatoSoles.format(p.proximaCuota.monto_cuota)}</span>
                </div>
              ) : (
                <p className="text-sm text-teal">✓ Préstamo completamente pagado</p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}