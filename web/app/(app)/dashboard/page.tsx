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

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [prestamos, setPrestamos] = useState<PrestamoActivo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const formatoSoles = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });
  const formatoFecha = new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric" });

  useEffect(() => {
    setMounted(true);
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setCargando(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = "/login?next=/dashboard"; return; }

    const { data: activos, error: errorActivos } = await supabase
      .from("loan_active")
      .select("id, estado, fecha_inicio, loan_simulations(monto, plazo_meses, tea, tcea_calculada)")
      .order("fecha_inicio", { ascending: false });

    if (errorActivos) { setError(errorActivos.message); setCargando(false); return; }

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

  if (!mounted || cargando) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Cargando panel financiero...</p>
      </div>
    );
  }

  // Cálculos para los KPIs
  const totalPrestamos = prestamos.length;
  const deudaTotal = prestamos.reduce((acc, p) => acc + p.loan_simulations.monto, 0);
  const proximoPago = prestamos.find(p => p.proximaCuota)?.proximaCuota?.monto_cuota || 0;
  const prestamosActivos = prestamos.filter(p => p.estado === 'activo').length;

  return (
    <div className="space-y-6">
      {error && <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">{error}</div>}

      {/* --- 1. TARJETAS KPI --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Préstamos</p>
            <p className="text-3xl font-extrabold text-navy">{totalPrestamos}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Deuda Total</p>
            <p className="text-2xl font-extrabold text-navy">{formatoSoles.format(deudaTotal)}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Próximo Pago</p>
            <p className="text-2xl font-extrabold text-navy">{formatoSoles.format(proximoPago)}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Activos</p>
            <p className="text-3xl font-extrabold text-navy">{prestamosActivos}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>
      </div>

      {/* --- 2. GRÁFICOS VISUALES --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Donut (CSS puro) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-navy mb-6">Distribución de Deuda</h3>
          <div className="flex items-center justify-center relative">
            {/* SVG Donut Chart */}
            <svg viewBox="0 0 36 36" className="w-40 h-40 transform -rotate-90">
              <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
              <path className="text-teal" strokeDasharray="70, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
            </svg>
            <div className="absolute text-center">
              <p className="text-2xl font-extrabold text-navy">{formatoSoles.format(deudaTotal)}</p>
              <p className="text-xs text-slate-500 font-medium">Total</p>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-6 text-xs font-medium">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-teal"></span> Capital</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-slate-200"></span> Interés</span>
          </div>
        </div>

        {/* Gráfico de Barras (CSS puro) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
          <h3 className="font-bold text-navy mb-6">Préstamos por Plazo (Meses)</h3>
          <div className="space-y-4">
            {prestamos.slice(0, 4).map((p, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-sm font-bold text-slate-600 w-16">{p.loan_simulations.plazo_meses} meses</span>
                <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-navy rounded-full" 
                    style={{ width: `${(p.loan_simulations.monto / deudaTotal) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-navy w-24 text-right">{formatoSoles.format(p.loan_simulations.monto)}</span>
              </div>
            ))}
            {prestamos.length === 0 && <p className="text-sm text-slate-400 text-center py-10">No hay datos suficientes</p>}
          </div>
        </div>
      </div>

      {/* --- 3. TABLA DE DATOS (Estilo Empresarial) --- */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-navy text-lg">Tus Préstamos Activos</h3>
          <Link href="/simular" className="text-sm font-bold text-teal hover:underline">+ Nuevo</Link>
        </div>
        
        {prestamos.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <span className="text-5xl mb-4">📭</span>
            <h2 className="text-xl font-bold text-navy mb-2">No tienes préstamos activos</h2>
            <p className="text-slate-500 mb-6 max-w-sm">Comienza simulando un préstamo para ver tu cronograma aquí.</p>
            <Link href="/simular" className="btn-primary">Simular mi primer préstamo</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Monto</th>
                  <th className="px-6 py-4">Plazo</th>
                  <th className="px-6 py-4">TCEA</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Próxima Cuota</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {prestamos.map((p) => {
                  const porcentajePagado = p.proximaCuota ? ((p.proximaCuota.numero_cuota - 1) / p.loan_simulations.plazo_meses) * 100 : 100;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-navy">{formatoSoles.format(p.loan_simulations.monto)}</td>
                      <td className="px-6 py-4 text-slate-600">{p.loan_simulations.plazo_meses} meses</td>
                      <td className="px-6 py-4 text-slate-600">{(p.loan_simulations.tcea_calculada * 100).toFixed(2)}%</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          p.estado === 'activo' ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {p.estado.charAt(0).toUpperCase() + p.estado.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {p.proximaCuota ? (
                          <div>
                            <p className="font-bold text-navy">{formatoSoles.format(p.proximaCuota.monto_cuota)}</p>
                            <p className="text-xs text-slate-500">{formatoFecha.format(new Date(p.proximaCuota.fecha_pago))}</p>
                          </div>
                        ) : (
                          <span className="text-teal font-bold text-xs">✓ Pagado</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/dashboard/prestamo/${p.id}`} className="text-teal font-bold hover:underline text-xs uppercase tracking-wide">
                          Ver detalle
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}